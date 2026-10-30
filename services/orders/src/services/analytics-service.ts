import { prisma } from "../config/database";
import { Prisma } from "@local-services/database";
import {
  DashboardOverviewDto,
  RevenueAnalyticsDto,
  TopServicesDto,
  TechnicianRankingDto,
} from "../dto/analytics.dto";

export class AnalyticsService {
  async getOverviewStats(): Promise<DashboardOverviewDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get active bookings (not completed or cancelled)
    const activeBookings = await prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"],
        },
      },
    });

    // Get revenue this month
    const revenueMTD = await prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        completedDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get revenue previous month
    const revenuePrevMonth = await prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        completedDate: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get bookings this month vs previous month for trend
    const [bookingsThisMonth, bookingsPrevMonth] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfPrevMonth,
            lte: endOfPrevMonth,
          },
        },
      }),
    ]);

    // Get unique users count (approximation from orders)
    const uniqueUsers = await prisma.order.groupBy({
      by: ["userId"],
      _count: true,
    });

    // Get technicians count
    const totalTechnicians = await prisma.technicianProfile.count();

    // Calculate trends
    const currentRevenue = Number(revenueMTD._sum.totalAmount || 0);
    const prevRevenue = Number(revenuePrevMonth._sum.totalAmount || 0);
    const revenueChange =
      prevRevenue > 0
        ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
        : 0;

    const bookingsChange =
      bookingsPrevMonth > 0
        ? Math.round(
            ((bookingsThisMonth - bookingsPrevMonth) / bookingsPrevMonth) * 100
          )
        : 0;

    return {
      activeBookings,
      revenueMTD: currentRevenue,
      totalUsers: uniqueUsers.length,
      totalTechnicians,
      trends: {
        bookingsChange,
        revenueChange,
      },
    };
  }

  async getRevenueAnalytics(
    period: "day" | "week" | "month" | "year"
  ): Promise<RevenueAnalyticsDto> {
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        prevEndDate = new Date(startDate);
        prevEndDate.setMilliseconds(prevEndDate.getMilliseconds() - 1);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        prevEndDate = new Date(startDate);
        prevEndDate.setMilliseconds(prevEndDate.getMilliseconds() - 1);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = new Date(startDate);
        prevEndDate.setMilliseconds(prevEndDate.getMilliseconds() - 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        prevEndDate = new Date(startDate);
        prevEndDate.setMilliseconds(prevEndDate.getMilliseconds() - 1);
        break;
    }

    // Get current period revenue
    const currentOrders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        completedDate: { gte: startDate },
      },
      select: {
        totalAmount: true,
        completedDate: true,
      },
    });

    // Get previous period revenue
    const prevOrders = await prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        completedDate: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      _sum: { totalAmount: true },
    });

    const total = currentOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0
    );
    const previousPeriod = Number(prevOrders._sum.totalAmount || 0);
    const percentChange =
      previousPeriod > 0
        ? Math.round(((total - previousPeriod) / previousPeriod) * 100)
        : 0;

    // Group by date for breakdown
    const breakdown: Map<string, { amount: number; orders: number }> = new Map();
    for (const order of currentOrders) {
      if (!order.completedDate) continue;
      const dateKey = order.completedDate.toISOString().split("T")[0]!;
      const existing = breakdown.get(dateKey) || { amount: 0, orders: 0 };
      existing.amount += Number(order.totalAmount);
      existing.orders += 1;
      breakdown.set(dateKey, existing);
    }

    return {
      total,
      period,
      breakdown: Array.from(breakdown.entries())
        .map(([date, data]) => ({
          date,
          amount: data.amount,
          orders: data.orders,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      comparison: {
        previousPeriod,
        percentChange,
      },
    };
  }

  async getTopServices(limit: number = 5): Promise<TopServicesDto> {
    // Get orders with service info
    const completedOrders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      include: { items: true },
    });

    // Aggregate by service
    const serviceStats: Map<
      string,
      { name: string; bookings: number; revenue: number }
    > = new Map();

    for (const order of completedOrders) {
      for (const item of order.items) {
        const existing = serviceStats.get(item.serviceId) || {
          name: item.serviceName,
          bookings: 0,
          revenue: 0,
        };
        existing.bookings += 1;
        existing.revenue += Number(item.totalPrice);
        serviceStats.set(item.serviceId, existing);
      }
    }

    const services = Array.from(serviceStats.entries()).map(
      ([serviceId, data]) => ({
        serviceId,
        name: data.name,
        bookings: data.bookings,
        revenue: data.revenue,
      })
    );

    return {
      topByBookings: [...services]
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, limit),
      topByRevenue: [...services]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit),
    };
  }

  async getTechnicianRankings(limit: number = 10): Promise<TechnicianRankingDto[]> {
    const technicians = await prisma.technicianProfile.findMany({
      orderBy: [{ rating: "desc" }, { completedJobs: "desc" }],
      take: limit,
    });

    // Get earnings for each technician
    const rankings: TechnicianRankingDto[] = [];

    for (const tech of technicians) {
      const earnings = await prisma.order.aggregate({
        where: {
          technicianId: tech.id,
          status: "COMPLETED",
        },
        _sum: { totalAmount: true },
      });

      const completionRate =
        tech.totalJobs > 0
          ? Math.round((tech.completedJobs / tech.totalJobs) * 100)
          : 0;

      rankings.push({
        id: tech.id,
        name: `${tech.firstName} ${tech.lastName}`,
        avatar: tech.avatar,
        rating: Number(tech.rating),
        jobsCompleted: tech.completedJobs,
        revenue: Number(earnings._sum.totalAmount || 0),
        completionRate,
      });
    }

    return rankings;
  }
}

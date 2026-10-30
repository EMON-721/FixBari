import { prisma } from "../config/database";
import { Prisma, OrderStatus } from "@local-services/database";
import { AppError } from "../middleware/error-handler";
import { getTierName, TierType } from "../utils/tier-pricing";
import {
  TechnicianJobQueryDto,
  AvailableJobQueryDto,
  TechnicianJobDto,
  AvailableJobDto,
  JobActionResponseDto,
  TechnicianScheduleDto,
  TechnicianAvailabilityDto,
  EarningsSummaryDto,
  EarningsHistoryItemDto,
  TechnicianStatsDto,
} from "../dto/technician.dto";
import { PaginatedResult } from "../dto/order-query.dto";

function formatAddress(address: {
  area: string;
  city: string;
  division: string;
  postalCode: string;
}): string {
  return `${address.area}, ${address.city}, ${address.division} ${address.postalCode}`;
}

function mapOrderToJob(
  order: Prisma.OrderGetPayload<{
    include: { items: true; address: true };
  }>
): TechnicianJobDto {
  const scheduledDate = order.scheduledDate;
  const now = new Date();
  const isUrgent =
    scheduledDate && scheduledDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000;

  return {
    id: order.id,
    bookingId: order.bookingId,
    serviceName: order.items[0]?.serviceName || "Unknown Service",
    customer: {
      name: "Customer", // Would need to fetch from auth service
      phone: null,
    },
    address: order.address
      ? {
          area: order.address.area,
          city: order.address.city,
          division: order.address.division,
          postalCode: order.address.postalCode,
          fullAddress: formatAddress(order.address),
        }
      : {
          area: "",
          city: "",
          division: "",
          postalCode: "",
          fullAddress: "",
        },
    scheduledDate: order.scheduledDate?.toISOString() || null,
    scheduledTime: order.scheduledTime,
    estimatedDuration: 60, // Default 60 mins, could be from service
    totalAmount: Number(order.totalAmount),
    status: order.status,
    urgency: isUrgent ? "urgent" : "normal",
    notes: order.notes,
    additionalInfo: order.additionalInfo,
    createdAt: order.createdAt.toISOString(),
  };
}

export class TechnicianService {
  async getAssignedJobs(
    technicianId: string,
    options: TechnicianJobQueryDto
  ): Promise<PaginatedResult<TechnicianJobDto>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      technicianId,
      status: {
        in: options.status === "in_progress" ? ["IN_PROGRESS"] : ["ASSIGNED", "IN_PROGRESS"],
      },
    };

    if (options.date) {
      const date = new Date(options.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      where.scheduledDate = {
        gte: date,
        lt: nextDay,
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
        },
        orderBy: [{ scheduledDate: "asc" }, { createdAt: "asc" }],
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(mapOrderToJob),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAvailableJobs(
    technicianId: string,
    options: AvailableJobQueryDto
  ): Promise<PaginatedResult<AvailableJobDto>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Get technician's service areas
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new AppError(404, "Technician profile not found", "NOT_FOUND");
    }
    if (technician.verificationStatus !== "VERIFIED" || !technician.isAvailable) {
      throw new AppError(403, "Verified and available technician required", "NOT_VERIFIED");
    }

    const where: Prisma.OrderWhereInput = {
      technicianId: null, // Unassigned orders
      status: { in: ["PENDING", "CONFIRMED"] },
    };

    // Filter by division if specified, otherwise use technician's service areas
    if (options.division) {
      where.address = { division: options.division };
    } else if (technician.serviceAreas.length > 0) {
      where.address = { division: { in: technician.serviceAreas } };
    }

    // Filter by service category if specified
    if (options.serviceCategory) {
      where.items = {
        some: {
          serviceName: { contains: options.serviceCategory, mode: "insensitive" },
        },
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const data: AvailableJobDto[] = orders.map((order) => ({
      id: order.id,
      bookingId: order.bookingId,
      serviceName: order.items[0]?.serviceName || "Unknown Service",
      serviceCategory: order.items[0]?.serviceName.split(" ")[0] || "General",
      address: order.address
        ? {
            city: order.address.city,
            division: order.address.division,
            area: order.address.area,
          }
        : { city: "", division: "", area: "" },
      scheduledDate: order.scheduledDate?.toISOString() || null,
      scheduledTime: order.scheduledTime,
      estimatedEarnings: {
        min: Math.floor(Number(order.totalAmount) * 0.7),
        max: Math.floor(Number(order.totalAmount) * 0.85),
      },
      postedAt: order.createdAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getJobDetails(
    technicianId: string,
    orderId: string
  ): Promise<TechnicianJobDto | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      return null;
    }

    // Check if technician is assigned to this order or if it's available
    if (order.technicianId && order.technicianId !== technicianId) {
      throw new AppError(403, "Access denied", "FORBIDDEN");
    }

    return mapOrderToJob(order);
  }

  async acceptJob(
    technicianId: string,
    orderId: string
  ): Promise<JobActionResponseDto> {
    const technician=await prisma.technicianProfile.findUnique({where:{id:technicianId}});
    if (!technician || technician.verificationStatus!=="VERIFIED" || !technician.isAvailable) {
      throw new AppError(403,"Technician is not verified and available","NOT_VERIFIED");
    }
    // Conditional update prevents two technicians claiming the same unassigned order.
    const updatedOrder=await prisma.$transaction(async tx => {
      const result=await tx.order.updateMany({
        where:{id:orderId,technicianId:null,status:{in:["PENDING","CONFIRMED"]}},
        data:{technicianId,status:"ASSIGNED",assignedAt:new Date()},
      });
      if(result.count!==1)throw new AppError(409,"Job already assigned or unavailable","ALREADY_ASSIGNED");
      await tx.orderHistory.create({data:{orderId,fromStatus:"PENDING",toStatus:"ASSIGNED",changedBy:technicianId,changedByRole:"TECHNICIAN",reason:"Technician accepted available job"}});
      await tx.technicianProfile.update({where:{id:technicianId},data:{totalJobs:{increment:1}}});
      const order=await tx.order.findUnique({where:{id:orderId},include:{items:true,address:true}});
      if(!order)throw new AppError(404,"Job not found");
      return order;
    });
    return {success:true,order:mapOrderToJob(updatedOrder),message:"Job accepted successfully"};
  }

  async rejectJob(
    technicianId: string,
    orderId: string,
    reason?: string
  ): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    // Only can reject if not already assigned to someone else
    if (order.technicianId && order.technicianId !== technicianId) {
      throw new AppError(403, "Cannot reject order assigned to another technician", "FORBIDDEN");
    }

    // If assigned to this technician, unassign
    if (order.technicianId === technicianId) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            technicianId: null,
            status: "CONFIRMED",
            assignedAt: null,
          },
        }),
        prisma.orderHistory.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: "CONFIRMED",
            changedBy: technicianId,
            changedByRole: "TECHNICIAN",
            reason: reason || "Technician rejected job",
          },
        }),
      ]);
    }
    // If not assigned, just log the rejection (for analytics)
  }

  async startJob(
    technicianId: string,
    orderId: string
  ): Promise<JobActionResponseDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    if (order.technicianId !== technicianId) {
      throw new AppError(403, "Not assigned to this job", "FORBIDDEN");
    }

    if (order.status !== "ASSIGNED") {
      throw new AppError(400, "Can only start assigned jobs", "INVALID_STATUS");
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
        include: {
          items: true,
          address: true,
        },
      }),
      prisma.orderHistory.create({
        data: {
          orderId,
          fromStatus: "ASSIGNED",
          toStatus: "IN_PROGRESS",
          changedBy: technicianId,
          changedByRole: "TECHNICIAN",
        },
      }),
    ]);

    return {
      success: true,
      order: mapOrderToJob(updatedOrder),
      message: "Job started successfully",
    };
  }

  async completeJob(
    technicianId: string,
    orderId: string,
    notes?: string
  ): Promise<JobActionResponseDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    if (order.technicianId !== technicianId) {
      throw new AppError(403, "Not assigned to this job", "FORBIDDEN");
    }

    if (order.status !== "IN_PROGRESS") {
      throw new AppError(400, "Can only complete in-progress jobs", "INVALID_STATUS");
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          completedDate: new Date(),
          ...(notes && { notes: order.notes ? `${order.notes}\n${notes}` : notes }),
        },
        include: {
          items: true,
          address: true,
        },
      }),
      prisma.orderHistory.create({
        data: {
          orderId,
          fromStatus: "IN_PROGRESS",
          toStatus: "COMPLETED",
          changedBy: technicianId,
          changedByRole: "TECHNICIAN",
          reason: notes,
        },
      }),
      prisma.technicianProfile.update({
        where: { id: technicianId },
        data: {
          completedJobs: { increment: 1 },
        },
      }),
    ]);

    return {
      success: true,
      order: mapOrderToJob(updatedOrder),
      message: "Job completed successfully",
    };
  }

  async getSchedule(technicianId: string): Promise<TechnicianScheduleDto> {
    const [availability, upcomingOrders] = await Promise.all([
      prisma.technicianAvailability.findMany({
        where: { technicianId },
        orderBy: { dayOfWeek: "asc" },
      }),
      prisma.order.findMany({
        where: {
          technicianId,
          status: { in: ["ASSIGNED", "IN_PROGRESS"] },
          scheduledDate: { gte: new Date() },
        },
        include: {
          items: true,
          address: true,
        },
        orderBy: { scheduledDate: "asc" },
        take: 10,
      }),
    ]);

    return {
      availability: availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isAvailable: a.isAvailable,
      })),
      upcomingJobs: upcomingOrders.map((order) => ({
        id: order.id,
        bookingId: order.bookingId,
        serviceName: order.items[0]?.serviceName || "Unknown Service",
        scheduledDate: order.scheduledDate?.toISOString() || "",
        scheduledTime: order.scheduledTime || "",
        address: order.address ? formatAddress(order.address) : "",
      })),
    };
  }

  async updateSchedule(
    technicianId: string,
    availability: TechnicianAvailabilityDto[]
  ): Promise<void> {
    // Verify technician exists
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new AppError(404, "Technician profile not found", "NOT_FOUND");
    }

    // Delete existing availability and create new
    await prisma.$transaction([
      prisma.technicianAvailability.deleteMany({
        where: { technicianId },
      }),
      ...availability.map((a) =>
        prisma.technicianAvailability.create({
          data: {
            technicianId,
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
            isAvailable: a.isAvailable,
          },
        })
      ),
    ]);
  }

  async getEarnings(
    technicianId: string,
    period: "week" | "month" | "year" = "month"
  ): Promise<EarningsSummaryDto> {
    const now = new Date();
    let startOfPeriod: Date;
    let startOfPrevPeriod: Date;
    let endOfPrevPeriod: Date;

    switch (period) {
      case "week":
        startOfPeriod = new Date(now);
        startOfPeriod.setDate(now.getDate() - 7);
        startOfPrevPeriod = new Date(startOfPeriod);
        startOfPrevPeriod.setDate(startOfPrevPeriod.getDate() - 7);
        endOfPrevPeriod = new Date(startOfPeriod);
        break;
      case "month":
        startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfPrevPeriod = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endOfPrevPeriod = new Date(startOfPeriod);
        break;
      case "year":
        startOfPeriod = new Date(now.getFullYear(), 0, 1);
        startOfPrevPeriod = new Date(now.getFullYear() - 1, 0, 1);
        endOfPrevPeriod = new Date(startOfPeriod);
        break;
    }

    const [currentOrders, prevOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          technicianId,
          status: "COMPLETED",
          completedDate: { gte: startOfPeriod },
        },
        include: { items: true },
      }),
      prisma.order.findMany({
        where: {
          technicianId,
          status: "COMPLETED",
          completedDate: {
            gte: startOfPrevPeriod,
            lt: endOfPrevPeriod,
          },
        },
      }),
    ]);

    const currentTotal = currentOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount) * 0.7, // 70% to technician
      0
    );
    const prevTotal = prevOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount) * 0.7,
      0
    );

    const percentChange =
      prevTotal > 0
        ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100)
        : 0;

    // Group by service category for breakdown
    const breakdown: Map<string, { amount: number; jobs: number }> = new Map();
    for (const order of currentOrders) {
      const category = order.items[0]?.serviceName.split(" ")[0] || "Other";
      const existing = breakdown.get(category) || { amount: 0, jobs: 0 };
      existing.amount += Number(order.totalAmount) * 0.7;
      existing.jobs += 1;
      breakdown.set(category, existing);
    }

    return {
      currentMonth: {
        total: Math.round(currentTotal),
        jobsCompleted: currentOrders.length,
        averagePerJob:
          currentOrders.length > 0
            ? Math.round(currentTotal / currentOrders.length)
            : 0,
      },
      previousMonth: {
        total: Math.round(prevTotal),
        jobsCompleted: prevOrders.length,
      },
      percentChange,
      breakdown: Array.from(breakdown.entries()).map(([category, data]) => ({
        serviceCategory: category,
        amount: Math.round(data.amount),
        jobs: data.jobs,
      })),
    };
  }

  async getEarningsHistory(
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<EarningsHistoryItemDto>> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          technicianId,
          status: "COMPLETED",
        },
        include: { items: true },
        orderBy: { completedDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: {
          technicianId,
          status: "COMPLETED",
        },
      }),
    ]);

    const data: EarningsHistoryItemDto[] = orders.map((order) => ({
      id: order.id,
      bookingId: order.bookingId,
      serviceName: order.items[0]?.serviceName || "Unknown Service",
      amount: Math.round(Number(order.totalAmount) * 0.7),
      completedAt: order.completedDate?.toISOString() || "",
      customer: "Customer", // Would fetch from auth
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(technicianId: string): Promise<TechnicianStatsDto> {
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new AppError(404, "Technician profile not found", "NOT_FOUND");
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Get order counts
    const [
      totalReviews,
      jobsThisMonth,
      jobsThisWeek,
      completedThisMonth,
      monthlyEarnings,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          technicianId,
          rating: { not: null },
        },
      }),
      prisma.order.count({
        where: {
          technicianId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.order.count({
        where: {
          technicianId,
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.order.count({
        where: {
          technicianId,
          status: "COMPLETED",
          completedDate: { gte: startOfMonth },
        },
      }),
      prisma.order.aggregate({
        where: {
          technicianId,
          status: "COMPLETED",
          completedDate: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const completionRate =
      technician.totalJobs > 0
        ? Math.round((technician.completedJobs / technician.totalJobs) * 100)
        : 0;

    return {
      rating: Number(technician.rating),
      totalReviews,
      completionRate,
      onTimeRate: 95, // Would calculate from actual data
      acceptanceRate: 92, // Would calculate from actual data
      jobsThisMonth,
      jobsThisWeek,
      totalEarningsThisMonth: Math.round(
        Number(monthlyEarnings._sum.totalAmount || 0) * 0.7
      ),
      responseTime: "15 min average", // Would calculate from actual data
    };
  }

  // ==================== PROFILE ====================

  async syncProfile(
    technicianId: string,
    data: { firstName: string; lastName: string; phone?: string }
  ) {
    // Upsert the profile - create if doesn't exist, update if does
    const profile = await prisma.technicianProfile.upsert({
      where: { id: technicianId },
      create: {
        id: technicianId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        isAvailable: true,
        serviceAreas: [],
        specializations: [],
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.phone && { phone: data.phone }),
      },
    });

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      avatar: profile.avatar,
      rating: Number(profile.rating),
      totalJobs: profile.totalJobs,
      completedJobs: profile.completedJobs,
      isAvailable: profile.isAvailable,
      verificationStatus: profile.verificationStatus,
      serviceAreas: profile.serviceAreas,
      specializations: profile.specializations,
    };
  }

  async getProfile(technicianId: string) {
    const profile = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
    });

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      avatar: profile.avatar,
      rating: Number(profile.rating),
      totalJobs: profile.totalJobs,
      completedJobs: profile.completedJobs,
      isAvailable: profile.isAvailable,
      verificationStatus: profile.verificationStatus,
      serviceAreas: profile.serviceAreas,
      specializations: profile.specializations,
    };
  }

  async updateProfile(
    technicianId: string,
    data: {
      phone?: string;
      serviceAreas?: string[];
      specializations?: string[];
      isAvailable?: boolean;
    }
  ) {
    const profile = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
    });

    if (!profile) {
      throw new AppError(404, "Technician profile not found. Please sync your profile first.", "NOT_FOUND");
    }

    const updated = await prisma.technicianProfile.update({
      where: { id: technicianId },
      data: {
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.serviceAreas !== undefined && { serviceAreas: data.serviceAreas }),
        ...(data.specializations !== undefined && { specializations: data.specializations }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
    });

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      avatar: updated.avatar,
      rating: Number(updated.rating),
      totalJobs: updated.totalJobs,
      completedJobs: updated.completedJobs,
      isAvailable: updated.isAvailable,
      serviceAreas: updated.serviceAreas,
      specializations: updated.specializations,
    };
  }
}

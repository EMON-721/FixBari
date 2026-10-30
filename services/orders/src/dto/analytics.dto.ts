export interface DashboardOverviewDto {
  activeBookings: number;
  revenueMTD: number;
  totalUsers: number;
  totalTechnicians: number;
  trends: {
    bookingsChange: number;
    revenueChange: number;
  };
}

export interface RevenueAnalyticsDto {
  total: number;
  period: "day" | "week" | "month" | "year";
  breakdown: Array<{
    date: string;
    amount: number;
    orders: number;
  }>;
  comparison: {
    previousPeriod: number;
    percentChange: number;
  };
}

export interface TopServicesDto {
  topByBookings: Array<{
    serviceId: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  topByRevenue: Array<{
    serviceId: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface TechnicianRankingDto {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
  jobsCompleted: number;
  revenue: number;
  completionRate: number;
}

import { OrderStatus } from "@local-services/database";

export interface TechnicianJobQueryDto {
  status?: "assigned" | "in_progress";
  date?: string;
  page?: number;
  limit?: number;
}

export interface AvailableJobQueryDto {
  division?: string;
  serviceCategory?: string;
  page?: number;
  limit?: number;
}

export interface TechnicianJobDto {
  id: string;
  bookingId: string;
  serviceName: string;
  customer: {
    name: string;
    phone: string | null;
  };
  address: {
    area: string;
    city: string;
    division: string;
    postalCode: string;
    fullAddress: string;
  };
  scheduledDate: string | null;
  scheduledTime: string | null;
  estimatedDuration: number;
  totalAmount: number;
  status: string;
  urgency: "normal" | "urgent";
  notes: string | null;
  additionalInfo: string | null;
  createdAt: string;
}

export interface AvailableJobDto {
  id: string;
  bookingId: string;
  serviceName: string;
  serviceCategory: string;
  address: {
    city: string;
    division: string;
    area: string;
  };
  scheduledDate: string | null;
  scheduledTime: string | null;
  estimatedEarnings: {
    min: number;
    max: number;
  };
  postedAt: string;
}

export interface JobActionResponseDto {
  success: boolean;
  order: TechnicianJobDto;
  message: string;
}

export interface TechnicianAvailabilityDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface UpdateScheduleDto {
  availability: TechnicianAvailabilityDto[];
}

export interface TechnicianScheduleDto {
  availability: TechnicianAvailabilityDto[];
  upcomingJobs: Array<{
    id: string;
    bookingId: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    address: string;
  }>;
}

export interface EarningsSummaryDto {
  currentMonth: {
    total: number;
    jobsCompleted: number;
    averagePerJob: number;
  };
  previousMonth: {
    total: number;
    jobsCompleted: number;
  };
  percentChange: number;
  breakdown: Array<{
    serviceCategory: string;
    amount: number;
    jobs: number;
  }>;
}

export interface EarningsHistoryItemDto {
  id: string;
  bookingId: string;
  serviceName: string;
  amount: number;
  completedAt: string;
  customer: string;
}

export interface TechnicianStatsDto {
  rating: number;
  totalReviews: number;
  completionRate: number;
  onTimeRate: number;
  acceptanceRate: number;
  jobsThisMonth: number;
  jobsThisWeek: number;
  totalEarningsThisMonth: number;
  responseTime: string;
}

export interface RejectJobDto {
  reason?: string;
}

export interface CompleteJobDto {
  notes?: string;
}

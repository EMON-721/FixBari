import { prisma } from "../config/database";
import { Prisma, OrderStatus, PaymentMethod, PaymentStatus } from "@local-services/database";
import { AppError } from "../middleware/error-handler";
import { generateBookingId, isValidBookingId } from "../utils/booking-id";
import {
  calculateTierPrice,
  getTierName,
  TIER_TO_ENUM,
  TierType,
  getTierMultiplier,
} from "../utils/tier-pricing";
import {
  CreateBookingDto,
  BookingResponseDto,
  BookingListItemDto,
  BookingDetailsDto,
  BookingStatus,
  AddReviewDto,
  PaymentStatusType,
} from "../dto/create-booking.dto";
import { PaginationOptions, PaginatedResult } from "../dto/order-query.dto";

interface PaymentInitiationData {
  orderId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: {
    area: string;
    city: string;
    division: string;
    postalCode: string;
  };
  serviceDescription: string;
}

interface PaymentInitiationResponse {
  success: boolean;
  data?: {
    paymentId: string;
    sessionId: string;
    gatewayUrl: string;
    tranId: string;
    expiresAt: string;
  };
  error?: {
    message: string;
  };
}

function mapOrderStatusToBookingStatus(status: OrderStatus): BookingStatus {
  const statusMap: Record<OrderStatus, BookingStatus> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    ASSIGNED: "assigned",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };
  return statusMap[status];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAddress(address: {
  area: string;
  city: string;
  division: string;
  postalCode: string;
}): string {
  return `${address.area}, ${address.city}, ${address.division} ${address.postalCode}`;
}

export class BookingService {
  async createBooking(
    userId: string,
    dto: CreateBookingDto,
    userInfo?: { name: string; email: string; phone: string }
  ): Promise<BookingResponseDto> {
    // Fetch service details
    const service = await prisma.service.findUnique({
      where: { id: dto.serviceId, isActive: true },
    });

    if (!service) {
      throw new AppError(400, "Service not found or inactive", "INVALID_SERVICE");
    }

    // Calculate pricing
    const baseAmount = service.basePrice;
    const tierMultiplier = new Prisma.Decimal(getTierMultiplier(dto.tier));
    const totalAmount = calculateTierPrice(baseAmount, dto.tier);

    // Generate unique booking ID
    let bookingId = generateBookingId();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.order.findUnique({
        where: { bookingId },
      });
      if (!existing) break;
      bookingId = generateBookingId();
      attempts++;
    }

    if (attempts >= 10) {
      throw new AppError(500, "Failed to generate unique booking ID", "INTERNAL_ERROR");
    }

    // Parse scheduled date
    const scheduledDate = new Date(dto.date);
    if (isNaN(scheduledDate.getTime())) {
      throw new AppError(400, "Invalid date format", "VALIDATION_ERROR");
    }

    // Determine payment method
    const paymentMethod: PaymentMethod = dto.paymentMethod === "ONLINE" ? "ONLINE" : "COD";

    // Create order with booking data
    const order = await prisma.order.create({
      data: {
        bookingId,
        userId,
        status: "PENDING",
        totalAmount,
        baseAmount,
        tier: TIER_TO_ENUM[dto.tier],
        tierMultiplier,
        areaSize: dto.areaSize,
        scheduledDate,
        scheduledTime: dto.time,
        additionalInfo: dto.additionalInfo,
        paymentMethod,
        paymentStatus: "PENDING",
        items: {
          create: [
            {
              serviceId: service.id,
              serviceName: service.name,
              quantity: 1,
              unitPrice: baseAmount,
              totalPrice: totalAmount,
            },
          ],
        },
        address: {
          create: {
            area: dto.area,
            city: dto.city,
            division: dto.division,
            postalCode: dto.postalCode,
          },
        },
        history: {
          create: {
            fromStatus: null,
            toStatus: "PENDING",
            changedBy: userId,
            changedByRole: "CUSTOMER",
          },
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    let gatewayUrl: string | undefined;
    let paymentStatus: PaymentStatusType = "PENDING";

    // If online payment, initiate payment session
    if (paymentMethod === "ONLINE" && userInfo) {
      try {
        const paymentResponse = await this.initiatePayment({
          orderId: order.id,
          bookingId: order.bookingId,
          userId,
          amount: Number(order.totalAmount),
          currency: "BDT",
          customerName: userInfo.name,
          customerEmail: userInfo.email,
          customerPhone: userInfo.phone,
          customerAddress: {
            area: dto.area,
            city: dto.city,
            division: dto.division,
            postalCode: dto.postalCode,
          },
          serviceDescription: `${service.name} - ${getTierName(dto.tier)} Package`,
        });

        if (paymentResponse.success && paymentResponse.data) {
          gatewayUrl = paymentResponse.data.gatewayUrl;
          paymentStatus = "INITIATED";

          // Update order with payment session info
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentId: paymentResponse.data.paymentId,
              paymentSessionId: paymentResponse.data.sessionId,
              paymentStatus: "INITIATED",
            },
          });
        }
      } catch (error) {
        console.error("Failed to initiate payment:", error);
        // Still return success but without gateway URL
        // User can retry payment later
      }
    }

    return {
      bookingId: order.bookingId,
      serviceName: service.name,
      tierName: getTierName(dto.tier),
      date: formatDate(scheduledDate),
      time: dto.time,
      address: formatAddress({
        area: dto.area,
        city: dto.city,
        division: dto.division,
        postalCode: dto.postalCode,
      }),
      totalPrice: Number(order.totalAmount),
      status: "pending",
      paymentMethod: dto.paymentMethod,
      paymentStatus,
      gatewayUrl,
    };
  }

  private async initiatePayment(data: PaymentInitiationData): Promise<PaymentInitiationResponse> {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost/api/payment";

    const response = await fetch(`${paymentServiceUrl}/sslcommerz/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Service-Token": process.env.PAYMENT_INTERNAL_TOKEN || "" },
      body: JSON.stringify({
        order_id: data.orderId,
        booking_id: data.bookingId,
        user_id: data.userId,
        amount: data.amount,
        currency: data.currency,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        customer_address: data.customerAddress,
        service_description: data.serviceDescription,
      }),
    });

    return response.json() as Promise<PaymentInitiationResponse>;
  }

  async getUserBookings(
    userId: string,
    options: PaginationOptions & { status?: string }
  ): Promise<PaginatedResult<BookingListItemDto>> {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(options.status && { status: options.status as OrderStatus }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: options.limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Fetch technician profiles for orders with technicianId
    const technicianIds = orders
      .filter((o) => o.technicianId)
      .map((o) => o.technicianId as string);

    const technicians =
      technicianIds.length > 0
        ? await prisma.technicianProfile.findMany({
            where: { id: { in: technicianIds } },
          })
        : [];

    const technicianMap = new Map(technicians.map((t) => [t.id, t]));

    const data: BookingListItemDto[] = orders.map((order) => {
      const technician = order.technicianId
        ? technicianMap.get(order.technicianId)
        : null;

      return {
        id: order.id,
        bookingId: order.bookingId,
        serviceName: order.items[0]?.serviceName || "Unknown Service",
        tierName: getTierName(order.tier.toLowerCase() as TierType),
        date: order.scheduledDate ? formatDate(order.scheduledDate) : "",
        time: order.scheduledTime || "",
        address: order.address ? formatAddress(order.address) : "",
        totalPrice: Number(order.totalAmount),
        status: mapOrderStatusToBookingStatus(order.status),
        technician: technician
          ? {
              name: `${technician.firstName} ${technician.lastName}`,
              phone: technician.phone,
              avatar: technician.avatar,
              rating: Number(technician.rating),
            }
          : null,
        createdAt: order.createdAt.toISOString(),
      };
    });

    return {
      data,
      meta: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  async getBookingByBookingId(
    bookingId: string,
    userId: string
  ): Promise<BookingDetailsDto | null> {
    if (!isValidBookingId(bookingId)) {
      throw new AppError(400, "Invalid booking ID format", "VALIDATION_ERROR");
    }

    const order = await prisma.order.findUnique({
      where: { bookingId },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      return null;
    }

    // Check ownership (customers can only view their own)
    if (order.userId !== userId) {
      throw new AppError(403, "Access denied", "FORBIDDEN");
    }

    // Fetch technician if assigned
    let technician = null;
    if (order.technicianId) {
      technician = await prisma.technicianProfile.findUnique({
        where: { id: order.technicianId },
      });
    }

    return {
      id: order.id,
      bookingId: order.bookingId,
      serviceName: order.items[0]?.serviceName || "Unknown Service",
      tierName: getTierName(order.tier.toLowerCase() as TierType),
      date: order.scheduledDate ? formatDate(order.scheduledDate) : "",
      time: order.scheduledTime || "",
      address: order.address ? formatAddress(order.address) : "",
      totalPrice: Number(order.totalAmount),
      status: mapOrderStatusToBookingStatus(order.status),
      technician: technician
        ? {
            name: `${technician.firstName} ${technician.lastName}`,
            phone: technician.phone,
            avatar: technician.avatar,
            rating: Number(technician.rating),
          }
        : null,
      areaSize: order.areaSize,
      additionalInfo: order.additionalInfo,
      notes: order.notes,
      rating: order.rating,
      review: order.review,
      completedDate: order.completedDate?.toISOString() || null,
      assignedAt: order.assignedAt?.toISOString() || null,
      startedAt: order.startedAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
    };
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    if (!isValidBookingId(bookingId)) {
      throw new AppError(400, "Invalid booking ID format", "VALIDATION_ERROR");
    }

    const order = await prisma.order.findUnique({
      where: { bookingId },
    });

    if (!order) {
      throw new AppError(404, "Booking not found", "NOT_FOUND");
    }

    if (order.userId !== userId) {
      throw new AppError(403, "Access denied", "FORBIDDEN");
    }

    // Only allow cancellation if status is PENDING or CONFIRMED
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      throw new AppError(
        400,
        "Cannot cancel booking in current status",
        "INVALID_STATUS"
      );
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      }),
      prisma.orderHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "CANCELLED",
          changedBy: userId,
          changedByRole: "CUSTOMER",
          reason,
        },
      }),
    ]);
  }

  async addReview(
    bookingId: string,
    userId: string,
    dto: AddReviewDto
  ): Promise<void> {
    if (!isValidBookingId(bookingId)) {
      throw new AppError(400, "Invalid booking ID format", "VALIDATION_ERROR");
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new AppError(400, "Rating must be between 1 and 5", "VALIDATION_ERROR");
    }

    const order = await prisma.order.findUnique({
      where: { bookingId },
    });

    if (!order) {
      throw new AppError(404, "Booking not found", "NOT_FOUND");
    }

    if (order.userId !== userId) {
      throw new AppError(403, "Access denied", "FORBIDDEN");
    }

    if (order.status !== "COMPLETED") {
      throw new AppError(
        400,
        "Can only review completed bookings",
        "INVALID_STATUS"
      );
    }

    if (order.rating !== null) {
      throw new AppError(400, "Booking already has a review", "ALREADY_REVIEWED");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        rating: dto.rating,
        review: dto.review,
      },
    });

    // Update technician rating if assigned
    if (order.technicianId) {
      const completedOrders = await prisma.order.findMany({
        where: {
          technicianId: order.technicianId,
          status: "COMPLETED",
          rating: { not: null },
        },
        select: { rating: true },
      });

      const avgRating =
        completedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) /
        completedOrders.length;

      await prisma.technicianProfile.update({
        where: { id: order.technicianId },
        data: {
          rating: new Prisma.Decimal(avgRating.toFixed(1)),
        },
      });
    }
  }
}

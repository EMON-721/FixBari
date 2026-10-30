import { prisma } from "../config/database";
import { Prisma, OrderStatus } from "@local-services/database";
import { AppError } from "../middleware/error-handler";
import { generateBookingId } from "../utils/booking-id";
import { getTierName, TierType } from "../utils/tier-pricing";
import {
  AdminOrderQueryDto,
  UpdateOrderDto,
  AdminOrderListItemDto,
  AdminOrderDetailsDto,
  PaginatedResult,
} from "../dto/order-query.dto";

interface CreateOrderInput {
  userId: string;
  items: Array<{
    serviceId: string;
    quantity: number;
  }>;
  address: {
    area: string;
    city: string;
    division: string;
    postalCode: string;
  };
  scheduledDate?: Date;
  scheduledTime?: string;
  notes?: string;
}

interface GetOrdersOptions {
  page: number;
  limit: number;
  status?: string;
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    // Fetch service details for each item
    const serviceIds = input.items.map((item) => item.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        isActive: true,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new AppError(400, "One or more services not found", "INVALID_SERVICE");
    }

    // Calculate totals
    const orderItems = input.items.map((item) => {
      const service = services.find((s) => s.id === item.serviceId)!;
      const totalPrice = service.basePrice.mul(item.quantity);

      return {
        serviceId: service.id,
        serviceName: service.name,
        quantity: item.quantity,
        unitPrice: service.basePrice,
        totalPrice,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum.add(item.totalPrice),
      new Prisma.Decimal(0)
    );

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

    // Create order with items and address
    const order = await prisma.order.create({
      data: {
        bookingId,
        userId: input.userId,
        totalAmount,
        baseAmount: totalAmount,
        tier: "STANDARD",
        tierMultiplier: new Prisma.Decimal(1.0),
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime,
        notes: input.notes,
        items: {
          create: orderItems,
        },
        address: {
          create: input.address,
        },
        history: {
          create: {
            fromStatus: null,
            toStatus: "PENDING",
            changedBy: input.userId,
            changedByRole: "CUSTOMER",
          },
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    return order;
  }

  async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
      },
    });
  }

  async getUserOrders(userId: string, options: GetOrdersOptions) {
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

    return { orders, total };
  }

  async updateOrderStatus(id: string, status: OrderStatus, changedBy: string, changedByRole: string) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status,
          ...(status === "COMPLETED" && { completedDate: new Date() }),
          ...(status === "IN_PROGRESS" && { startedAt: new Date() }),
        },
        include: {
          items: true,
          address: true,
        },
      }),
      prisma.orderHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: status,
          changedBy,
          changedByRole,
        },
      }),
    ]);

    return updatedOrder;
  }

  // ==================== ADMIN METHODS ====================

  async getAllOrders(
    options: AdminOrderQueryDto
  ): Promise<PaginatedResult<AdminOrderListItemDto>> {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.OrderWhereInput = {};

    if (options.status) {
      where.status = options.status;
    }

    if (options.technicianId) {
      where.technicianId = options.technicianId;
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        where.createdAt.lte = new Date(options.endDate);
      }
    }

    if (options.search) {
      where.OR = [
        { bookingId: { contains: options.search, mode: "insensitive" } },
        { items: { some: { serviceName: { contains: options.search, mode: "insensitive" } } } },
      ];
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (options.sortBy) {
      orderBy[options.sortBy] = options.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
        },
        orderBy,
        skip,
        take: options.limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Fetch technician profiles
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

    const data: AdminOrderListItemDto[] = orders.map((order) => {
      const technician = order.technicianId
        ? technicianMap.get(order.technicianId)
        : null;

      return {
        id: order.id,
        bookingId: order.bookingId,
        // Flattened fields for list view
        serviceName: order.items[0]?.serviceName || "Unknown Service",
        userName: "Customer", // Would need to fetch from auth service
        technicianName: technician
          ? `${technician.firstName} ${technician.lastName}`
          : null,
        // Nested objects for detail view
        customer: {
          id: order.userId,
          name: "Customer", // Would need to fetch from auth service
          phone: null,
          email: "",
        },
        service: {
          id: order.items[0]?.serviceId || "",
          name: order.items[0]?.serviceName || "Unknown Service",
        },
        technician: technician
          ? {
              id: technician.id,
              name: `${technician.firstName} ${technician.lastName}`,
              phone: technician.phone,
              rating: Number(technician.rating),
            }
          : null,
        status: order.status,
        tier: getTierName(order.tier.toLowerCase() as TierType),
        totalAmount: Number(order.totalAmount),
        scheduledDate: order.scheduledDate?.toISOString() || null,
        scheduledTime: order.scheduledTime,
        address: order.address
          ? {
              area: order.address.area,
              city: order.address.city,
              division: order.address.division,
              postalCode: order.address.postalCode,
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

  async getOrderDetails(id: string): Promise<AdminOrderDetailsDto | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return null;
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
      // Flattened fields for list view
      serviceName: order.items[0]?.serviceName || "Unknown Service",
      userName: "Customer",
      technicianName: technician
        ? `${technician.firstName} ${technician.lastName}`
        : null,
      // Nested objects for detail view
      customer: {
        id: order.userId,
        name: "Customer",
        phone: null,
        email: "",
      },
      service: {
        id: order.items[0]?.serviceId || "",
        name: order.items[0]?.serviceName || "Unknown Service",
      },
      technician: technician
        ? {
            id: technician.id,
            name: `${technician.firstName} ${technician.lastName}`,
            phone: technician.phone,
            rating: Number(technician.rating),
          }
        : null,
      status: order.status,
      tier: getTierName(order.tier.toLowerCase() as TierType),
      totalAmount: Number(order.totalAmount),
      baseAmount: Number(order.baseAmount),
      tierMultiplier: Number(order.tierMultiplier),
      scheduledDate: order.scheduledDate?.toISOString() || null,
      scheduledTime: order.scheduledTime,
      address: order.address
        ? {
            area: order.address.area,
            city: order.address.city,
            division: order.address.division,
            postalCode: order.address.postalCode,
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
      items: order.items.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      history: order.history.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedBy: h.changedBy,
        changedByRole: h.changedByRole,
        reason: h.reason,
        createdAt: h.createdAt.toISOString(),
      })),
    };
  }

  async updateOrder(
    id: string,
    dto: UpdateOrderDto,
    changedBy: string,
    changedByRole: string
  ) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    const updateData: Prisma.OrderUpdateInput = {};

    if (dto.scheduledDate) {
      updateData.scheduledDate = new Date(dto.scheduledDate);
    }
    if (dto.scheduledTime) {
      updateData.scheduledTime = dto.scheduledTime;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }
    if (dto.technicianId) {
      updateData.technicianId = dto.technicianId;
      if (order.status === "CONFIRMED" || order.status === "PENDING") {
        updateData.status = "ASSIGNED";
        updateData.assignedAt = new Date();
      }
    }
    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === "COMPLETED") {
        updateData.completedDate = new Date();
      }
      if (dto.status === "IN_PROGRESS") {
        updateData.startedAt = new Date();
      }
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
          address: true,
        },
      }),
      ...(dto.status && dto.status !== order.status
        ? [
            prisma.orderHistory.create({
              data: {
                orderId: id,
                fromStatus: order.status,
                toStatus: dto.status,
                changedBy,
                changedByRole,
              },
            }),
          ]
        : []),
    ]);

    return updatedOrder;
  }

  async deleteOrder(id: string) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    // Soft delete by setting status to CANCELLED
    await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  async assignTechnician(
    orderId: string,
    technicianId: string,
    changedBy: string
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    // Verify technician exists
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new AppError(404, "Technician not found", "NOT_FOUND");
    }
    if (technician.verificationStatus !== "VERIFIED" || !technician.isAvailable) {
      throw new AppError(409, "Technician must be verified and available", "TECHNICIAN_NOT_APPROVED");
    }

    const newStatus: OrderStatus =
      order.status === "PENDING" || order.status === "CONFIRMED"
        ? "ASSIGNED"
        : order.status;

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          technicianId,
          status: newStatus,
          assignedAt: new Date(),
        },
        include: {
          items: true,
          address: true,
        },
      }),
      prisma.orderHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: newStatus,
          changedBy,
          changedByRole: "ADMIN",
          reason: `Assigned to technician: ${technician.firstName} ${technician.lastName}`,
        },
      }),
      prisma.technicianProfile.update({
        where: { id: technicianId },
        data: {
          totalJobs: { increment: 1 },
        },
      }),
    ]);

    return updatedOrder;
  }

  async getAvailableTechnicians(division?: string, serviceCategory?: string) {
    const where: Prisma.TechnicianProfileWhereInput = {
      isAvailable: true,
      verificationStatus: "VERIFIED",
    };

    if (division) {
      where.serviceAreas = { has: division };
    }

    if (serviceCategory) {
      where.specializations = { has: serviceCategory };
    }

    const technicians = await prisma.technicianProfile.findMany({
      where,
      orderBy: [{ rating: "desc" }, { completedJobs: "desc" }],
    });

    return technicians.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      phone: t.phone,
      avatar: t.avatar,
      rating: Number(t.rating),
      totalJobs: t.totalJobs,
      completedJobs: t.completedJobs,
      serviceAreas: t.serviceAreas,
      specializations: t.specializations,
    }));
  }
}

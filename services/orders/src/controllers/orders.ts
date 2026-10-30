import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { OrderService } from "../services/order-service";
import { AppError } from "../middleware/error-handler";
import { publishOrderPlaced } from "../config/rabbitmq";

const orderService = new OrderService();

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, "Validation failed", "VALIDATION_ERROR");
    }

    const userId = req.user!.id;
    const { items, address, scheduledDate, scheduledTime, notes } = req.body;

    const order = await orderService.createOrder({
      userId,
      items,
      address,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      scheduledTime,
      notes,
    });

    // Publish event
    await publishOrderPlaced(order.id, userId, Number(order.totalAmount));

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id!;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await orderService.getOrderById(id);

    if (!order) {
      throw new AppError(404, "Order not found", "NOT_FOUND");
    }

    // Only allow access to own orders (unless admin/technician)
    if (order.userId !== userId && userRole === "CUSTOMER") {
      throw new AppError(403, "Access denied", "FORBIDDEN");
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const { orders, total } = await orderService.getUserOrders(userId, {
      page,
      limit,
      status,
    });

    res.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id!;
    const { status } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role.toUpperCase();

    // Only admins and technicians can update status
    if (userRole === "CUSTOMER") {
      throw new AppError(403, "Only staff can update order status", "FORBIDDEN");
    }

    const order = await orderService.updateOrderStatus(id, status, userId, userRole);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

import type { Request, Response } from "express";
import { OrderService } from "../services/order-service";
import { AnalyticsService } from "../services/analytics-service";
import { OrderStatus } from "@local-services/database";
import { UpdateOrderDto, AssignTechnicianDto } from "../dto";

const orderService = new OrderService();
const analyticsService = new AnalyticsService();

export async function getAllOrders(req: Request, res: Response) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const status = req.query.status as OrderStatus | undefined;
  const technicianId = req.query.technicianId as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const search = req.query.search as string | undefined;
  const sortBy = req.query.sortBy as "createdAt" | "scheduledDate" | "totalAmount" | undefined;
  const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

  const result = await orderService.getAllOrders({
    page,
    limit,
    status,
    technicianId,
    startDate,
    endDate,
    search,
    sortBy,
    sortOrder,
  });

  res.json({
    success: true,
    ...result,
  });
}

export async function getOrderDetails(req: Request, res: Response) {
  const id = req.params.id!;

  const result = await orderService.getOrderDetails(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Order not found",
      },
    });
  }

  res.json({
    success: true,
    data: result,
  });
}

export async function updateOrder(req: Request, res: Response) {
  const id = req.params.id!;
  const userId = req.user!.id;
  const dto = req.body as UpdateOrderDto;

  const result = await orderService.updateOrder(id, dto, userId, "ADMIN");

  res.json({
    success: true,
    data: result,
  });
}

export async function deleteOrder(req: Request, res: Response) {
  const id = req.params.id!;

  await orderService.deleteOrder(id);

  res.json({
    success: true,
    message: "Order cancelled successfully",
  });
}

export async function assignTechnician(req: Request, res: Response) {
  const id = req.params.id!;
  const userId = req.user!.id;
  const { technicianId } = req.body as AssignTechnicianDto;

  const result = await orderService.assignTechnician(id, technicianId, userId);

  res.json({
    success: true,
    data: result,
    message: "Technician assigned successfully",
  });
}

export async function getAvailableTechnicians(req: Request, res: Response) {
  const division = req.query.division as string | undefined;
  const serviceCategory = req.query.serviceCategory as string | undefined;

  const result = await orderService.getAvailableTechnicians(division, serviceCategory);

  res.json({
    success: true,
    data: result,
  });
}

export async function getOverviewStats(req: Request, res: Response) {
  const result = await analyticsService.getOverviewStats();

  res.json({
    success: true,
    data: result,
  });
}

export async function getRevenueAnalytics(req: Request, res: Response) {
  const period = (req.query.period as "day" | "week" | "month" | "year") || "month";

  const result = await analyticsService.getRevenueAnalytics(period);

  res.json({
    success: true,
    data: result,
  });
}

export async function getTopServices(req: Request, res: Response) {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 5));

  const result = await analyticsService.getTopServices(limit);

  res.json({
    success: true,
    data: result,
  });
}

export async function getTechnicianRankings(req: Request, res: Response) {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

  const result = await analyticsService.getTechnicianRankings(limit);

  res.json({
    success: true,
    data: result,
  });
}

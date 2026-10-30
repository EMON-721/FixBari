import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";

export async function getServices(req: Request, res: Response, next: NextFunction) {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const active = req.query.active === "true";

    const services = await prisma.service.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(active && { isActive: true }),
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
}

export async function getServiceById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id!;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError(404, "Service not found", "NOT_FOUND");
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
}

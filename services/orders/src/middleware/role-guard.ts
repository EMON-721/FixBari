import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error-handler";

export type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role?.toUpperCase() as UserRole | undefined;

    if (!userRole) {
      throw new AppError(401, "Authentication required", "UNAUTHORIZED");
    }

    if (!allowedRoles.includes(userRole)) {
      throw new AppError(
        403,
        `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        "FORBIDDEN"
      );
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole("ADMIN")(req, res, next);
}

export function requireTechnician(req: Request, res: Response, next: NextFunction) {
  return requireRole("TECHNICIAN", "ADMIN")(req, res, next);
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  return requireRole("CUSTOMER", "ADMIN")(req, res, next);
}

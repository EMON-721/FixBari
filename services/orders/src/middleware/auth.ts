import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error-handler";

interface JwtPayload {
  sub: string;
  tokenUse: "access" | "refresh";
  email: string;
  role: string;
  mfa?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or invalid authorization header", "UNAUTHORIZED");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET missing"); })()
    ) as JwtPayload;

    if (payload.tokenUse !== "access" || !payload.sub) {
      throw new AppError(401, "Access token required", "UNAUTHORIZED");
    }
    if (payload.role === "ADMIN" && process.env.REQUIRE_ADMIN_MFA === "true" && payload.mfa !== true) {
      throw new AppError(401, "Admin MFA required", "UNAUTHORIZED");
    }
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    throw new AppError(401, "Invalid token", "UNAUTHORIZED");
  }
}

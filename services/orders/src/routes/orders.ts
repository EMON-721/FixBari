import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import {
  createOrder,
  getOrder,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/orders";

export const ordersRouter = Router();

// All routes require authentication
ordersRouter.use(authMiddleware);

ordersRouter.post(
  "/",
  [
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.serviceId").isString().notEmpty(),
    body("items.*.quantity").isInt({ min: 1 }),
    body("address.area").isString().notEmpty(),
    body("address.city").isString().notEmpty(),
    body("address.division").isString().notEmpty(),
    body("address.postalCode").isString().notEmpty(),
    body("scheduledDate").optional().isISO8601(),
    body("scheduledTime").optional().isString(),
    body("notes").optional().isString(),
  ],
  createOrder
);

ordersRouter.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isString(),
  ],
  getUserOrders
);

ordersRouter.get(
  "/:id",
  [param("id").isUUID()],
  getOrder
);

ordersRouter.patch(
  "/:id/status",
  [
    param("id").isUUID(),
    body("status").isIn([
      "PENDING",
      "CONFIRMED",
      "ASSIGNED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]),
  ],
  updateOrderStatus
);

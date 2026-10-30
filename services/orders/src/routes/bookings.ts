import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/role-guard";
import * as bookingsController from "../controllers/bookings";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/orders/bookings - Create a new booking
router.post(
  "/",
  requireRole("CUSTOMER", "ADMIN"),
  [
    body("serviceId").isUUID().withMessage("Valid service ID is required"),
    body("areaSize").notEmpty().withMessage("Area size is required"),
    body("tier")
      .isIn(["standard", "premium", "deluxe"])
      .withMessage("Tier must be standard, premium, or deluxe"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("area").notEmpty().withMessage("Area is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("division").notEmpty().withMessage("Division is required"),
    body("postalCode").notEmpty().withMessage("Postal code is required"),
    body("additionalInfo").optional().isString(),
  ],
  bookingsController.createBooking
);

// GET /api/orders/bookings - Get user's bookings
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  ],
  bookingsController.getUserBookings
);

// GET /api/orders/bookings/:bookingId - Get booking details
router.get(
  "/:bookingId",
  [param("bookingId").matches(/^BK-[A-Z0-9]{6}$/).withMessage("Invalid booking ID format")],
  bookingsController.getBookingDetails
);

// PATCH /api/orders/bookings/:bookingId/cancel - Cancel a booking
router.patch(
  "/:bookingId/cancel",
  [
    param("bookingId").matches(/^BK-[A-Z0-9]{6}$/).withMessage("Invalid booking ID format"),
    body("reason").optional().isString(),
  ],
  bookingsController.cancelBooking
);

// POST /api/orders/bookings/:bookingId/review - Add review to booking
router.post(
  "/:bookingId/review",
  [
    param("bookingId").matches(/^BK-[A-Z0-9]{6}$/).withMessage("Invalid booking ID format"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("review").notEmpty().withMessage("Review text is required"),
  ],
  bookingsController.addReview
);

export default router;

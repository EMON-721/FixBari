import type { Request, Response } from "express";
import { BookingService } from "../services/booking-service";
import { CreateBookingDto, AddReviewDto, CancelBookingDto } from "../dto";
import { isValidTier } from "../utils/tier-pricing";

const bookingService = new BookingService();

interface CreateBookingRequest extends CreateBookingDto {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export async function createBooking(req: Request, res: Response) {
  const userId = req.user!.id;
  const body = req.body as CreateBookingRequest;

  // Extract customer info for payment (can come from user profile or request)
  const { customerName, customerEmail, customerPhone, ...dto } = body;

  if (!isValidTier(dto.tier)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid tier. Must be standard, premium, or deluxe",
      },
    });
  }

  // Validate payment method
  if (dto.paymentMethod && !["ONLINE", "COD"].includes(dto.paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid payment method. Must be ONLINE or COD",
      },
    });
  }

  // Default to COD if not provided
  if (!dto.paymentMethod) {
    dto.paymentMethod = "COD";
  }

  // Build user info for payment if online
  const userInfo = dto.paymentMethod === "ONLINE" && customerName && customerEmail && customerPhone
    ? {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      }
    : undefined;

  const result = await bookingService.createBooking(userId, dto, userInfo);

  res.status(201).json({
    success: true,
    data: result,
  });
}

export async function getUserBookings(req: Request, res: Response) {
  const userId = req.user!.id;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const status = req.query.status as string | undefined;

  const result = await bookingService.getUserBookings(userId, {
    page,
    limit,
    status,
  });

  res.json({
    success: true,
    ...result,
  });
}

export async function getBookingDetails(req: Request, res: Response) {
  const userId = req.user!.id;
  const bookingId = req.params.bookingId!;

  const result = await bookingService.getBookingByBookingId(bookingId, userId);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Booking not found",
      },
    });
  }

  res.json({
    success: true,
    data: result,
  });
}

export async function cancelBooking(req: Request, res: Response) {
  const userId = req.user!.id;
  const bookingId = req.params.bookingId!;
  const { reason } = req.body as CancelBookingDto;

  await bookingService.cancelBooking(bookingId, userId, reason);

  res.json({
    success: true,
    message: "Booking cancelled successfully",
  });
}

export async function addReview(req: Request, res: Response) {
  const userId = req.user!.id;
  const bookingId = req.params.bookingId!;
  const dto = req.body as AddReviewDto;

  await bookingService.addReview(bookingId, userId, dto);

  res.json({
    success: true,
    message: "Review added successfully",
  });
}

import type { Request, Response } from "express";
import { TechnicianService } from "../services/technician-service";
import {
  TechnicianJobQueryDto,
  AvailableJobQueryDto,
  UpdateScheduleDto,
  RejectJobDto,
  CompleteJobDto,
} from "../dto";

const technicianService = new TechnicianService();

export async function getAssignedJobs(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const options: TechnicianJobQueryDto = {
    status: req.query.status as "assigned" | "in_progress" | undefined,
    date: req.query.date as string | undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: Math.min(100, parseInt(req.query.limit as string) || 10),
  };

  const result = await technicianService.getAssignedJobs(technicianId, options);

  res.json({
    success: true,
    ...result,
  });
}

export async function getAvailableJobs(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const options: AvailableJobQueryDto = {
    division: req.query.division as string | undefined,
    serviceCategory: req.query.serviceCategory as string | undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: Math.min(100, parseInt(req.query.limit as string) || 10),
  };

  const result = await technicianService.getAvailableJobs(technicianId, options);

  res.json({
    success: true,
    ...result,
  });
}

export async function getJobDetails(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const id = req.params.id!;

  const result = await technicianService.getJobDetails(technicianId, id);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Job not found",
      },
    });
  }

  res.json({
    success: true,
    data: result,
  });
}

export async function acceptJob(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const id = req.params.id!;

  const result = await technicianService.acceptJob(technicianId, id);

  res.json({
    success: true,
    data: result.order,
    message: result.message,
  });
}

export async function rejectJob(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const id = req.params.id!;
  const { reason } = req.body as RejectJobDto;

  await technicianService.rejectJob(technicianId, id, reason);

  res.json({
    success: true,
    message: "Job rejected successfully",
  });
}

export async function startJob(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const id = req.params.id!;

  const result = await technicianService.startJob(technicianId, id);

  res.json({
    success: true,
    data: result.order,
    message: result.message,
  });
}

export async function completeJob(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const id = req.params.id!;
  const { notes } = req.body as CompleteJobDto;

  const result = await technicianService.completeJob(technicianId, id, notes);

  res.json({
    success: true,
    data: result.order,
    message: result.message,
  });
}

export async function getSchedule(req: Request, res: Response) {
  const technicianId = req.user!.id;

  const result = await technicianService.getSchedule(technicianId);

  res.json({
    success: true,
    data: result,
  });
}

export async function updateSchedule(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const { availability } = req.body as UpdateScheduleDto;

  await technicianService.updateSchedule(technicianId, availability);

  res.json({
    success: true,
    message: "Schedule updated successfully",
  });
}

export async function getEarnings(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const period = (req.query.period as "week" | "month" | "year") || "month";

  const result = await technicianService.getEarnings(technicianId, period);

  res.json({
    success: true,
    data: result,
  });
}

export async function getEarningsHistory(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(100, parseInt(req.query.limit as string) || 10);

  const result = await technicianService.getEarningsHistory(technicianId, page, limit);

  res.json({
    success: true,
    ...result,
  });
}

export async function getStats(req: Request, res: Response) {
  const technicianId = req.user!.id;

  const result = await technicianService.getStats(technicianId);

  res.json({
    success: true,
    data: result,
  });
}

// ==================== PROFILE ====================

export async function syncProfile(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const { firstName, lastName, phone } = req.body;

  const result = await technicianService.syncProfile(technicianId, {
    firstName,
    lastName,
    phone,
  });

  res.json({
    success: true,
    data: result,
    message: "Profile synced successfully",
  });
}

export async function getProfile(req: Request, res: Response) {
  const technicianId = req.user!.id;

  const result = await technicianService.getProfile(technicianId);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Profile not found. Please sync your profile first.",
      },
    });
  }

  res.json({
    success: true,
    data: result,
  });
}

export async function updateProfile(req: Request, res: Response) {
  const technicianId = req.user!.id;
  const { phone, serviceAreas, specializations, isAvailable } = req.body;

  const result = await technicianService.updateProfile(technicianId, {
    phone,
    serviceAreas,
    specializations,
    isAvailable,
  });

  res.json({
    success: true,
    data: result,
    message: "Profile updated successfully",
  });
}

import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/role-guard";
import * as technicianController from "../controllers/technician-jobs";

const router = Router();

// All technician routes require authentication and technician role
router.use(authMiddleware);
router.use(requireRole("TECHNICIAN", "ADMIN"));

// ==================== JOB MANAGEMENT ====================

// GET /api/orders/technician/jobs - Get assigned jobs
router.get(
  "/jobs",
  [
    query("status").optional().isIn(["assigned", "in_progress"]),
    query("date").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  technicianController.getAssignedJobs
);

// GET /api/orders/technician/jobs/available - Get available jobs nearby
router.get(
  "/jobs/available",
  [
    query("division").optional().isString(),
    query("serviceCategory").optional().isString(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  technicianController.getAvailableJobs
);

// GET /api/orders/technician/jobs/:id - Get job details
router.get(
  "/jobs/:id",
  [param("id").isUUID().withMessage("Valid job ID is required")],
  technicianController.getJobDetails
);

// POST /api/orders/technician/jobs/:id/accept - Accept available job
router.post(
  "/jobs/:id/accept",
  [param("id").isUUID().withMessage("Valid job ID is required")],
  technicianController.acceptJob
);

// POST /api/orders/technician/jobs/:id/reject - Reject offered job
router.post(
  "/jobs/:id/reject",
  [
    param("id").isUUID().withMessage("Valid job ID is required"),
    body("reason").optional().isString(),
  ],
  technicianController.rejectJob
);

// POST /api/orders/technician/jobs/:id/start - Start job
router.post(
  "/jobs/:id/start",
  [param("id").isUUID().withMessage("Valid job ID is required")],
  technicianController.startJob
);

// POST /api/orders/technician/jobs/:id/complete - Complete job
router.post(
  "/jobs/:id/complete",
  [
    param("id").isUUID().withMessage("Valid job ID is required"),
    body("notes").optional().isString(),
  ],
  technicianController.completeJob
);

// ==================== SCHEDULE ====================

// GET /api/orders/technician/schedule - Get weekly schedule
router.get("/schedule", technicianController.getSchedule);

// PUT /api/orders/technician/schedule - Update availability
router.put(
  "/schedule",
  [
    body("availability").isArray().withMessage("Availability array is required"),
    body("availability.*.dayOfWeek")
      .isInt({ min: 0, max: 6 })
      .withMessage("Day of week must be 0-6"),
    body("availability.*.startTime")
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("Start time must be in HH:MM format"),
    body("availability.*.endTime")
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("End time must be in HH:MM format"),
    body("availability.*.isAvailable").isBoolean(),
  ],
  technicianController.updateSchedule
);

// ==================== EARNINGS ====================

// GET /api/orders/technician/earnings - Get earnings summary
router.get(
  "/earnings",
  [query("period").optional().isIn(["week", "month", "year"])],
  technicianController.getEarnings
);

// GET /api/orders/technician/earnings/history - Get earnings history
router.get(
  "/earnings/history",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  technicianController.getEarningsHistory
);

// ==================== STATS ====================

// GET /api/orders/technician/stats - Get performance metrics
router.get("/stats", technicianController.getStats);

// ==================== PROFILE ====================

// POST /api/orders/technician/profile/sync - Sync/create technician profile
router.post(
  "/profile/sync",
  [
    body("firstName").isString().isLength({ min: 1 }),
    body("lastName").isString().isLength({ min: 1 }),
    body("phone").optional().isString(),
  ],
  technicianController.syncProfile
);

// GET /api/orders/technician/profile - Get technician profile
router.get("/profile", technicianController.getProfile);

// PATCH /api/orders/technician/profile - Update technician profile
router.patch(
  "/profile",
  [
    body("phone").optional().isString(),
    body("serviceAreas").optional().isArray(),
    body("specializations").optional().isArray(),
    body("isAvailable").optional().isBoolean(),
  ],
  technicianController.updateProfile
);

export default router;

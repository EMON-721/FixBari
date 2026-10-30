import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/role-guard";
import * as adminController from "../controllers/admin-orders";
import { prisma } from "../config/database";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole("ADMIN"));

// ==================== ORDER MANAGEMENT ====================

// GET /api/orders/admin/orders - Get all orders with filters
router.get(
  "/orders",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    query("technicianId").optional().isUUID(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("search").optional().isString(),
    query("sortBy").optional().isIn(["createdAt", "scheduledDate", "totalAmount"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  adminController.getAllOrders
);

// GET /api/orders/admin/orders/:id - Get order details
router.get(
  "/orders/:id",
  [param("id").isUUID().withMessage("Valid order ID is required")],
  adminController.getOrderDetails
);

// PATCH /api/orders/admin/orders/:id - Update order
router.patch(
  "/orders/:id",
  [
    param("id").isUUID().withMessage("Valid order ID is required"),
    body("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    body("technicianId").optional().isUUID(),
    body("scheduledDate").optional().isISO8601(),
    body("scheduledTime").optional().isString(),
    body("notes").optional().isString(),
  ],
  adminController.updateOrder
);

// DELETE /api/orders/admin/orders/:id - Delete (cancel) order
router.delete(
  "/orders/:id",
  [param("id").isUUID().withMessage("Valid order ID is required")],
  adminController.deleteOrder
);

// POST /api/orders/admin/orders/:id/assign - Assign technician
router.post(
  "/orders/:id/assign",
  [
    param("id").isUUID().withMessage("Valid order ID is required"),
    body("technicianId").isUUID().withMessage("Valid technician ID is required"),
  ],
  adminController.assignTechnician
);

// Verification data is distinct from availability; approval needs explicit admin action.
router.get("/technicians/review", async (_req, res, next) => {
  try {
    const data = await prisma.technicianProfile.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    res.json({ success: true, data: data.map(p => ({ id:p.id, name:`${p.firstName} ${p.lastName}`, phone:p.phone,
      specializations:p.specializations, serviceAreas:p.serviceAreas, isAvailable:p.isAvailable,
      verificationStatus:p.verificationStatus, completedJobs:p.completedJobs, rating:Number(p.rating) })) });
  } catch(e) { next(e); }
});
router.patch("/technicians/:id/verification", async (req, res, next) => {
  try {
    const value = req.body.verificationStatus;
    if (!["PENDING","VERIFIED","REJECTED"].includes(value)) return res.status(400).json({success:false,error:{message:"Invalid verification status"}});
    const profile = await prisma.technicianProfile.findUnique({where:{id:req.params.id}});
    if (!profile) return res.status(404).json({success:false,error:{message:"Technician not found"}});
    const updated = await prisma.technicianProfile.update({where:{id:profile.id},data:{verificationStatus:value}});
    return res.json({success:true,data:{id:updated.id,verificationStatus:updated.verificationStatus}});
  } catch(e) { next(e); }
});

// ==================== TECHNICIAN MANAGEMENT ====================

// GET /api/orders/admin/technicians - Get available technicians
router.get(
  "/technicians",
  [
    query("division").optional().isString(),
    query("serviceCategory").optional().isString(),
  ],
  adminController.getAvailableTechnicians
);

// ==================== ANALYTICS ====================

// GET /api/orders/admin/analytics/overview - Dashboard overview stats
router.get("/analytics/overview", adminController.getOverviewStats);

// GET /api/orders/admin/analytics/revenue - Revenue analytics
router.get(
  "/analytics/revenue",
  [query("period").optional().isIn(["day", "week", "month", "year"])],
  adminController.getRevenueAnalytics
);

// GET /api/orders/admin/analytics/services - Top services
router.get(
  "/analytics/services",
  [query("limit").optional().isInt({ min: 1, max: 20 }).toInt()],
  adminController.getTopServices
);

// GET /api/orders/admin/analytics/technicians - Technician rankings
router.get(
  "/analytics/technicians",
  [query("limit").optional().isInt({ min: 1, max: 50 }).toInt()],
  adminController.getTechnicianRankings
);

export default router;

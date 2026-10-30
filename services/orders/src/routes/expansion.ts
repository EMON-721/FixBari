import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/role-guard";
import { AppError } from "../middleware/error-handler";
import { prisma } from "../config/database";
import { calculateRepairEstimate, type Complexity, type PackageTier } from "../utils/repair-estimate";

const router = Router();
router.use(authMiddleware);

// Only persisted requests are considered submitted. No phone, SMS or live emergency dispatch is promised.
const ALLOWED_KINDS = new Set(["EMERGENCY", "QUOTE", "PROPERTY", "APPLIANCE", "SUPPORT", "INSPECTION", "CONTRACT"]);
const ALLOWED_STATUS = new Set(["REQUESTED", "TRIAGED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"]);
const transitions: Record<string, string[]> = {
  REQUESTED: ["TRIAGED", "CANCELLED"],
  TRIAGED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: [], CANCELLED: [],
};
const wrap = (handler: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => { Promise.resolve(handler(req, res)).catch(next); };
const nonempty = (x: unknown): x is string => typeof x === "string" && x.trim().length > 0 && x.length <= 2000;

router.post("/estimate", requireRole("CUSTOMER", "ADMIN"), wrap(async (req, res) => {
  const {serviceId, complexity = "BASIC", tier = "STANDARD", district = "Dhaka"} = req.body;
  if (typeof serviceId !== "string" || !["BASIC","MODERATE","COMPLEX"].includes(complexity) || !["STANDARD","PREMIUM","DELUXE"].includes(tier)) throw new AppError(400, "Invalid estimator input");
  const service = await prisma.service.findUnique({where:{id: serviceId}});
  if (!service || !service.isActive) throw new AppError(404,"Service not found");
  const estimate=calculateRepairEstimate(Number(service.basePrice),complexity as Complexity,tier as PackageTier,String(district));
  res.json({success:true,data:estimate});
}));

router.post("/", requireRole("CUSTOMER","ADMIN"), wrap(async (req, res) => {
  const {kind,payload} = req.body;
  if (!ALLOWED_KINDS.has(kind) || !payload || typeof payload !== "object" || Array.isArray(payload) || Object.keys(payload).length > 35 || JSON.stringify(payload).length > 16000) throw new AppError(400,"Invalid request kind or payload");
  // Required metadata prevents empty / spam submissions; provider-specific validation follows in production modules.
  if (kind === "EMERGENCY" && (!nonempty(payload.service) || !nonempty(payload.area) || !nonempty(payload.description))) throw new AppError(400,"Emergency requires service, area and description");
  if (kind === "QUOTE" && (!nonempty(payload.subject) || !nonempty(payload.scope))) throw new AppError(400,"Quote requires subject and scope");
  const userId=req.user!.id;
  const result=await prisma.expansionRequest.create({data:{customerId:userId,kind,payload,events:{create:{actorId:userId,event:"CREATED"}}},include:{events:true}});
  res.status(201).json({success:true,data:result});
}));

router.get("/",wrap(async (req,res)=>{
  const role=req.user!.role.toUpperCase();
  const where=role==="ADMIN"?{}:role==="TECHNICIAN"?{assignedTechnicianId:req.user!.id}:{customerId:req.user!.id};
  const data=await prisma.expansionRequest.findMany({where,orderBy:{createdAt:"desc"},take:100,include:{offers:true}});
  res.json({success:true,data});
}));
// Only vetted professionals can see open quote scopes. Whitelist response fields to avoid exposing PII.
router.get("/opportunities",requireRole("TECHNICIAN"),wrap(async (req,res)=>{
  const technician=await prisma.technicianProfile.findUnique({where:{id:req.user!.id}});
  if (!technician || technician.verificationStatus!=="VERIFIED" || !technician.isAvailable) throw new AppError(403,"Verified active technician required");
  const items=await prisma.expansionRequest.findMany({where:{kind:"QUOTE",status:{in:["REQUESTED","TRIAGED"]}},orderBy:{createdAt:"desc"},take:50});
  res.json({success:true,data:items.map(x=>({id:x.id,kind:x.kind,status:x.status,createdAt:x.createdAt,subject:String((x.payload as Record<string,unknown>).subject||"").slice(0,150),scope:String((x.payload as Record<string,unknown>).scope||"").slice(0,2000),area:String((x.payload as Record<string,unknown>).area||"").slice(0,120)}))});
}));
router.get("/:id",wrap(async (req,res)=>{
  const data=await prisma.expansionRequest.findUnique({where:{id:req.params.id},include:{events:true,offers:true}});
  if (!data) throw new AppError(404,"Request not found");
  const role=req.user!.role.toUpperCase();
  if (role!=="ADMIN" && data.customerId!==req.user!.id && !(role==="TECHNICIAN"&&data.assignedTechnicianId===req.user!.id)) throw new AppError(403,"Not your request");
  res.json({success:true,data});
}));
router.patch("/:id/status",requireRole("ADMIN"),wrap(async (req,res)=>{
  const {status,assignedTechnicianId} = req.body;
  if (!ALLOWED_STATUS.has(status)) throw new AppError(400,"Invalid status");
  const item=await prisma.expansionRequest.findUnique({where:{id:req.params.id}});
  if (!item) throw new AppError(404,"Request not found");
  if (!(transitions[item.status]||[]).includes(status)) throw new AppError(409,"Invalid status transition");
  if (assignedTechnicianId !== undefined && (typeof assignedTechnicianId!=="string"||assignedTechnicianId.length>100)) throw new AppError(400,"Invalid technician ID");
  // In a live system, verify the technician belongs to the service area & is approved.
  const data=await prisma.expansionRequest.update({where:{id:item.id},data:{status, ...(assignedTechnicianId?{assignedTechnicianId}:{}),events:{create:{actorId:req.user!.id,event:`STATUS_${status}`}}}});
  res.json({success:true,data});
}));
router.post("/:id/offers",requireRole("TECHNICIAN","ADMIN"),wrap(async (req,res)=>{
  const amount=Number(req.body.amount),scope=req.body.scope;
  if (!Number.isFinite(amount)||amount<=0||amount>10000000||!nonempty(scope)) throw new AppError(400,"Invalid offer");
  const tech=await prisma.technicianProfile.findUnique({where:{id:req.user!.id}});
  if(req.user!.role!=="ADMIN"&&(!tech || tech.verificationStatus!=="VERIFIED" || !tech.isAvailable)) throw new AppError(403,"Verified active technician required");
  const item=await prisma.expansionRequest.findUnique({where:{id:req.params.id}});
  if (!item||item.kind!=="QUOTE"||!(["REQUESTED","TRIAGED"].includes(item.status))) throw new AppError(409,"Quote not accepting offers");
  const offer=await prisma.expansionOffer.upsert({where:{requestId_technicianId:{requestId:item.id,technicianId:req.user!.id}},create:{requestId:item.id,technicianId:req.user!.id,amount,scope},update:{amount,scope}});
  res.status(201).json({success:true,data:offer});
}));
router.post("/:id/offers/:offerId/select",requireRole("CUSTOMER","ADMIN"),wrap(async(req,res)=>{
  const item=await prisma.expansionRequest.findUnique({where:{id:req.params.id}});
  if(!item||(req.user!.role!=="ADMIN"&&item.customerId!==req.user!.id))throw new AppError(403,"Not your request");
  if(item.kind!=="QUOTE"||!(["REQUESTED","TRIAGED"].includes(item.status)))throw new AppError(409,"Quote closed");
  const offer=await prisma.expansionOffer.findUnique({where:{id:req.params.offerId}});
  if(!offer||offer.requestId!==item.id)throw new AppError(404,"Offer not found");
  await prisma.$transaction(async tx => {
    const updated=await tx.expansionRequest.updateMany({where:{id:item.id,status:{in:["REQUESTED","TRIAGED"]}},data:{status:"ASSIGNED",assignedTechnicianId:offer.technicianId}});
    if(updated.count!==1) throw new AppError(409,"Quotation was already selected");
    await tx.expansionOffer.update({where:{id:offer.id},data:{status:"SELECTED"}});
    await tx.expansionOffer.updateMany({where:{requestId:item.id,id:{not:offer.id}},data:{status:"NOT_SELECTED"}});
    await tx.expansionEvent.create({data:{requestId:item.id,actorId:req.user!.id,event:"OFFER_SELECTED"}});
  });
  res.json({success:true,data:{requestId:item.id,selectedOffer:offer.id}});
}));
export default router;

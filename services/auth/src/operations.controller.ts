import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, Req,
  UseGuards, BadRequestException, ForbiddenException,
  NotFoundException, ConflictException
} from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { OrderStatus } from "@local-services/database";
import { randomBytes } from "crypto";

type Caller={user:{id:string;role:string;email?:string}};
type Data=Record<string,unknown>;
const validStatuses=["PENDING","CONFIRMED","ASSIGNED","IN_PROGRESS","COMPLETED","CANCELLED"] as const;
const transitions:Record<string,string[]>={
 PENDING:["CONFIRMED","CANCELLED"],CONFIRMED:["ASSIGNED","CANCELLED"],
 ASSIGNED:["IN_PROGRESS","CANCELLED"],IN_PROGRESS:["COMPLETED","CANCELLED"],
 COMPLETED:[],CANCELLED:[]
};
const requestTransitions:Record<string,string[]>={
 REQUESTED:["TRIAGED","CANCELLED"],TRIAGED:["ASSIGNED","CANCELLED"],
 ASSIGNED:["IN_PROGRESS","CANCELLED"],IN_PROGRESS:["RESOLVED","CANCELLED"],RESOLVED:[],CANCELLED:[]
};
const kinds=["EMERGENCY","QUOTE","PROPERTY","APPLIANCE","SUPPORT","INSPECTION","CONTRACT"];
const asString=(v:unknown,max=240)=> {
 if(typeof v!=="string"||!v.trim()||v.length>max)
   throw new BadRequestException("Missing or invalid required field");
 return v.trim();
};
const safeInt=(v:unknown,def:number,min:number,max:number)=>{
 const n=v===undefined?def:Number(v);
 if(!Number.isInteger(n)||n<min||n>max)throw new BadRequestException("Invalid page or limit");
 return n;
};
const admin=(req:Caller)=>{
 if(req.user?.role!=="ADMIN")throw new ForbiddenException("Admin role required");
};
const ensureStaff=(req:Caller)=>{
 if(!["ADMIN","TECHNICIAN"].includes(req.user?.role))throw new ForbiddenException("Technician role required");
};
const asCurrency=(value:unknown)=>Number(value??0);
const tierFactors:Record<string,number>={standard:1,premium:1.5,deluxe:2};
const summary=(order:any,user?:any,tech?:any)=>({
  id:order.id,bookingId:order.bookingId,status:order.status,tier:order.tier,
  totalAmount:Number(order.totalAmount),scheduledDate:order.scheduledDate?.toISOString()||null,
  scheduledTime:order.scheduledTime||"",createdAt:order.createdAt.toISOString(),
  userName:user?`${user.firstName} ${user.lastName}`:"Customer",
  serviceName:order.items?.[0]?.serviceName||"Service",
  technicianName:tech?`${tech.firstName} ${tech.lastName}`:null,
  paymentMethod:order.paymentMethod,paymentStatus:order.paymentStatus,
});
function serialize(order:any){
 return {...order,totalAmount:Number(order.totalAmount),baseAmount:Number(order.baseAmount),
  tierMultiplier:Number(order.tierMultiplier),
  items:order.items?.map((item:any)=>({...item,unitPrice:Number(item.unitPrice),totalPrice:Number(item.totalPrice)}))};
}

@Controller("operations")
@UseGuards(JwtAuthGuard)
export class OperationsController {
 constructor(private readonly db:PrismaService){}

 @Get("admin/analytics/overview")
 async overview(@Req() req:Caller) {
  admin(req);
  const now=new Date(),month=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));
  const prev=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1));
  const [totalUsers,totalTechnicians,activeBookings,revenue,prevRevenue,curBookings,prevBookings]=await Promise.all([
   this.db.authUser.count({where:{role:"CUSTOMER"}}),
   this.db.technicianProfile.count(),
   this.db.order.count({where:{status:{in:["PENDING","CONFIRMED","ASSIGNED","IN_PROGRESS"]}}}),
   this.db.order.aggregate({where:{status:"COMPLETED",completedDate:{gte:month}},_sum:{totalAmount:true}}),
   this.db.order.aggregate({where:{status:"COMPLETED",completedDate:{gte:prev,lt:month}},_sum:{totalAmount:true}}),
   this.db.order.count({where:{createdAt:{gte:month}}}),
   this.db.order.count({where:{createdAt:{gte:prev,lt:month}}})
  ]);
  const mtd=Number(revenue._sum.totalAmount||0),last=Number(prevRevenue._sum.totalAmount||0);
  return {success:true,data:{totalUsers,totalTechnicians,activeBookings,revenueMTD:mtd,
   trends:{bookingsChange:prevBookings?Math.round((curBookings-prevBookings)*100/prevBookings):0,
           revenueChange:last?Math.round((mtd-last)*100/last):0}}};
 }

 @Get("admin/analytics/services")
 async topServices(@Req() req:Caller,@Query("limit") l?:string){
  admin(req);
  const completed=await this.db.order.findMany({where:{status:"COMPLETED"},include:{items:true},take:5000});
  const counts=new Map<string,{serviceId:string;name:string;bookings:number;revenue:number}>();
  for(const order of completed)for(const item of order.items){
    const prev=counts.get(item.serviceId)||{serviceId:item.serviceId,name:item.serviceName,bookings:0,revenue:0};
    prev.bookings++;prev.revenue+=Number(item.totalPrice);counts.set(item.serviceId,prev);
  }
  const all=[...counts.values()],limit=safeInt(l,5,1,20);
  return {success:true,topByBookings:[...all].sort((a,b)=>b.bookings-a.bookings).slice(0,limit),
   topByRevenue:[...all].sort((a,b)=>b.revenue-a.revenue).slice(0,limit)};
 }

 @Get("admin/analytics/revenue")
 async revenue(@Req() req:Caller,@Query("period") period:string="month"){
  admin(req);
  if(!["day","week","month","year"].includes(period))throw new BadRequestException("Unknown period");
  const now=new Date(),start=new Date(now);
  if(period==="day")start.setUTCHours(0,0,0,0);
  if(period==="week")start.setUTCDate(now.getUTCDate()-7);
  if(period==="month")start.setUTCDate(1),start.setUTCHours(0,0,0,0);
  if(period==="year")start.setUTCMonth(0,1),start.setUTCHours(0,0,0,0);
  const duration=now.getTime()-start.getTime();
  const previous=new Date(start.getTime()-duration);
  const [cur,prior]=await Promise.all([
   this.db.order.findMany({where:{status:"COMPLETED",completedDate:{gte:start}},select:{totalAmount:true,completedDate:true}}),
   this.db.order.aggregate({where:{status:"COMPLETED",completedDate:{gte:previous,lt:start}},_sum:{totalAmount:true}})
  ]);
  const byDay=new Map<string,{date:string;amount:number;orders:number}>();
  let total=0;
  for(const x of cur){const amount=Number(x.totalAmount);total+=amount;
   const date=x.completedDate?.toISOString().slice(0,10)||"unknown";
   const day=byDay.get(date)||{date,amount:0,orders:0};day.amount+=amount;day.orders++;
   byDay.set(date,day);
  }
  const previousPeriod=Number(prior._sum.totalAmount||0);
  return {success:true,data:{total,period,breakdown:[...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date)),
   comparison:{previousPeriod,percentChange:previousPeriod?Math.round((total-previousPeriod)*100/previousPeriod):0}}};
 }

 @Get("admin/analytics/technicians")
 async ranking(@Req() req:Caller,@Query("limit") l?:string){
  admin(req);const profiles=await this.db.technicianProfile.findMany({
   take:safeInt(l,10,1,50),orderBy:[{completedJobs:"desc"},{rating:"desc"}]
  });
  const result=await Promise.all(profiles.map(async p=>{
   const amount=await this.db.order.aggregate({where:{technicianId:p.id,status:"COMPLETED"},_sum:{totalAmount:true}});
   return {id:p.id,name:`${p.firstName} ${p.lastName}`,avatar:p.avatar,
    rating:Number(p.rating),jobsCompleted:p.completedJobs,revenue:Number(amount._sum.totalAmount||0),
    completionRate:p.totalJobs?Math.round(100*p.completedJobs/p.totalJobs):0};
  }));
  return {success:true,data:result};
 }

 @Get("admin/orders")
 async allOrders(@Req() req:Caller,@Query() q:Record<string,string>){
  admin(req);
  const page=safeInt(q.page,1,1,100000),limit=safeInt(q.limit,20,1,100);
  const where:any={};
  if(q.status){if(!validStatuses.includes(q.status as any))throw new BadRequestException("Invalid status");where.status=q.status;}
  if(q.technicianId)where.technicianId=q.technicianId;
  if(q.search?.trim().length)where.OR=[{bookingId:{contains:q.search.slice(0,120),mode:"insensitive"}},
   {items:{some:{serviceName:{contains:q.search.slice(0,120),mode:"insensitive"}}}}];
  const sortBy=["createdAt","scheduledDate","totalAmount"].includes(q.sortBy)?q.sortBy:"createdAt";
  const sortOrder=q.sortOrder==="asc"?"asc":"desc";
  const [orders,total]=await Promise.all([
    this.db.order.findMany({where,include:{items:true,address:true},orderBy:{[sortBy]:sortOrder},skip:(page-1)*limit,take:limit}),
    this.db.order.count({where})
  ]);
  const ids=[...new Set(orders.map(o=>o.userId))],
       techIds=[...new Set(orders.map(o=>o.technicianId).filter((x):x is string=>!!x))];
  const [users,techs]=await Promise.all([
    this.db.authUser.findMany({where:{id:{in:ids}},select:{id:true,firstName:true,lastName:true}}),
    this.db.technicianProfile.findMany({where:{id:{in:techIds}}})
  ]);
  const u=new Map(users.map(x=>[x.id,x])),t=new Map(techs.map(x=>[x.id,x]));
  return {success:true,data:orders.map(o=>summary(o,u.get(o.userId),o.technicianId?t.get(o.technicianId):undefined)),
   pagination:{page,limit,total,totalPages:Math.ceil(total/limit)}};
 }

 @Get("admin/orders/:id")
 async orderDetails(@Req() req:Caller,@Param("id") id:string){
  admin(req);
  const order=await this.db.order.findUnique({where:{id},include:{items:true,address:true,history:{orderBy:{createdAt:"desc"}}}});
  if(!order)throw new NotFoundException("Booking not found");
  const user=await this.db.authUser.findUnique({where:{id:order.userId},select:{id:true,firstName:true,lastName:true,email:true,phone:true}});
  const tech=order.technicianId?await this.db.technicianProfile.findUnique({where:{id:order.technicianId}}):null;
  return {success:true,data:{...serialize(order),user,technician:tech&&{...tech,rating:Number(tech.rating)}}};
 }

 @Patch("admin/orders/:id")
 async updateOrder(@Req() req:Caller,@Param("id") id:string,@Body() data:Data){
  admin(req);
  const order=await this.db.order.findUnique({where:{id}});
  if(!order)throw new NotFoundException("Booking not found");
  const changes:any={};
  if(data.status!==undefined){
   const status=asString(data.status,20);
   if(!transitions[order.status]?.includes(status))throw new ConflictException("Invalid booking status transition");
   changes.status=status as OrderStatus;
   if(status==="IN_PROGRESS")changes.startedAt=new Date();
   if(status==="COMPLETED")changes.completedDate=new Date();
  }
  if(data.scheduledDate!==undefined){
   const date=new Date(asString(data.scheduledDate,40));
   if(!Number.isFinite(date.getTime()))throw new BadRequestException("Invalid date");
   changes.scheduledDate=date;
  }
  if(data.scheduledTime!==undefined)changes.scheduledTime=asString(data.scheduledTime,40);
  if(data.notes!==undefined)changes.notes=asString(data.notes,2000);
  const result=await this.db.$transaction(async tx=>{
    const next=await tx.order.update({where:{id},data:changes,include:{items:true,address:true}});
    if(changes.status)await tx.orderHistory.create({data:{
     orderId:id,fromStatus:order.status,toStatus:changes.status,changedBy:req.user.id,changedByRole:"ADMIN"}});
    return next;
  });
  return {success:true,data:serialize(result)};
 }

 @Delete("admin/orders/:id")
 async cancelOrder(@Req() req:Caller,@Param("id") id:string){
  admin(req);
  const o=await this.db.order.findUnique({where:{id}});
  if(!o)throw new NotFoundException("Booking not found");
  if(["COMPLETED","CANCELLED"].includes(o.status))throw new ConflictException("Completed or cancelled bookings cannot be cancelled again");
  await this.db.$transaction([
   this.db.order.update({where:{id},data:{status:"CANCELLED"}}),
   this.db.orderHistory.create({data:{orderId:id,fromStatus:o.status,toStatus:"CANCELLED",changedBy:req.user.id,changedByRole:"ADMIN"}})
  ]);
  return {success:true,message:"Booking cancelled; historical record retained"};
 }

 @Post("admin/orders/:id/assign")
 async assign(@Req() req:Caller,@Param("id") id:string,@Body() data:Data){
  admin(req);
  const technicianId=asString(data.technicianId,100);
  const [order,tech]=await Promise.all([
   this.db.order.findUnique({where:{id}}),
   this.db.technicianProfile.findUnique({where:{id:technicianId}})
  ]);
  if(!order)throw new NotFoundException("Booking not found");
  if(!tech||tech.verificationStatus!=="VERIFIED"||!tech.isAvailable)
   throw new ConflictException("Only approved available technicians can be assigned");
  if(!["PENDING","CONFIRMED"].includes(order.status))
   throw new ConflictException("Booking cannot be assigned in current status");
  const changed=await this.db.$transaction(async tx=>{
   const v=await tx.order.update({where:{id},data:{technicianId,status:"ASSIGNED",assignedAt:new Date()},include:{items:true,address:true}});
   await tx.orderHistory.create({data:{orderId:id,fromStatus:order.status,toStatus:"ASSIGNED",
     changedBy:req.user.id,changedByRole:"ADMIN",reason:"Assigned to verified technician"}});
   await tx.technicianProfile.update({where:{id:technicianId},data:{totalJobs:{increment:1}}});
   return v;
  });
  return {success:true,data:serialize(changed)};
 }

 @Get("admin/technicians/review")
 async techReview(@Req() req:Caller){
  admin(req);
  const rows=await this.db.technicianProfile.findMany({orderBy:{createdAt:"desc"},take:200});
  return {success:true,data:rows.map(p=>({id:p.id,name:`${p.firstName} ${p.lastName}`,phone:p.phone,
   specializations:p.specializations,serviceAreas:p.serviceAreas,isAvailable:p.isAvailable,
   verificationStatus:p.verificationStatus,completedJobs:p.completedJobs,rating:Number(p.rating)}))};
 }
 @Get("admin/technicians")
 async techAvailable(@Req() req:Caller){
  admin(req);
  const rows=await this.db.technicianProfile.findMany({where:{verificationStatus:"VERIFIED",isAvailable:true}});
  return {success:true,data:rows.map(p=>({id:p.id,name:`${p.firstName} ${p.lastName}`,avatar:p.avatar,
   rating:Number(p.rating),completedJobs:p.completedJobs,isAvailable:p.isAvailable}))};
 }
 @Patch("admin/technicians/:id/verification")
 async updateVerification(@Req() req:Caller,@Param("id") id:string,@Body() body:Data) {
  admin(req);const status=asString(body.verificationStatus,16);
  if(!["PENDING","VERIFIED","REJECTED"].includes(status))throw new BadRequestException("Invalid verification");
  const p=await this.db.technicianProfile.findUnique({where:{id}});
  if(!p)throw new NotFoundException("Technician does not exist");
  const result=await this.db.technicianProfile.update({where:{id},data:{verificationStatus:status,isAvailable:status==="VERIFIED"?p.isAvailable:false}});
  return {success:true,data:{id:result.id,verificationStatus:result.verificationStatus}};
 }

 @Get("expansions")
 async expansionList(@Req() req:Caller){
  const role=req.user.role;
  const where=role==="ADMIN"?{}:role==="TECHNICIAN"?{assignedTechnicianId:req.user.id}:{customerId:req.user.id};
  return {success:true,data:await this.db.expansionRequest.findMany({
   where,orderBy:{createdAt:"desc"},take:100,include:{offers:true}
  })};
 }

 @Post("expansions")
 async newExpansion(@Req() req:Caller,@Body() body:Data){
  if(!["CUSTOMER","ADMIN"].includes(req.user.role))throw new ForbiddenException();
  const kind=asString(body.kind,20).toUpperCase();
  if(!kinds.includes(kind))throw new BadRequestException("Unsupported request type");
  const payload=body.payload;
  if(!payload||typeof payload!=="object"||Array.isArray(payload)||
     Object.keys(payload).length>35||JSON.stringify(payload).length>16000)
    throw new BadRequestException("Invalid request information");
  const p=payload as Data;
  if(kind==="EMERGENCY"&&(!p.service||!p.area||!p.description))
    throw new BadRequestException("Emergency service, area, and description are required");
  if(kind==="QUOTE"&&(!p.subject||!p.scope))
    throw new BadRequestException("Quotation subject and work scope are required");
  const data=await this.db.expansionRequest.create({data:{customerId:req.user.id,kind,payload:p as any,
   events:{create:{actorId:req.user.id,event:"CREATED"}}},include:{events:true}});
  return {success:true,data};
 }

 @Patch("expansions/:id/status")
 async setExpansionStatus(@Req() req:Caller,@Param("id") id:string,@Body() body:Data){
  admin(req);
  const status=asString(body.status,30);
  const old=await this.db.expansionRequest.findUnique({where:{id}});
  if(!old)throw new NotFoundException("Request not found");
  if(!requestTransitions[old.status]?.includes(status))throw new ConflictException("Invalid request transition");
  const result=await this.db.expansionRequest.update({where:{id},data:{
   status,events:{create:{actorId:req.user.id,event:`STATUS_${status}`}}
  }});
  return {success:true,data:result};
 }

 @Get("bookings")
 async userBookings(@Req() req:Caller,@Query("page") p?:string,@Query("limit") l?:string){
  const page=safeInt(p,1,1,100000),limit=safeInt(l,10,1,100);
  const where={userId:req.user.id};
  const [rows,total]=await Promise.all([
   this.db.order.findMany({where,include:{items:true,address:true},orderBy:{createdAt:"desc"},take:limit,skip:(page-1)*limit}),
   this.db.order.count({where})
  ]);
  const items=rows.map(row=>({
   id:row.id,bookingId:row.bookingId,serviceName:row.items[0]?.serviceName||"Service",
   tierName:row.tier[0]+row.tier.slice(1).toLowerCase(),
   date:row.scheduledDate?.toISOString().slice(0,10)||"",
   time:row.scheduledTime||"",
   address:row.address?`${row.address.area}, ${row.address.city}`:"",
   totalPrice:Number(row.totalAmount),status:row.status.toLowerCase().replace("_","-"),
   createdAt:row.createdAt.toISOString()
  }));
  return {success:true,data:items,pagination:{page,limit,total,totalPages:Math.ceil(total/limit)}};
 }

 @Get("bookings/:bookingId")
 async bookingDetails(@Req() req:Caller,@Param("bookingId") bookingId:string){
  const row=await this.db.order.findUnique({where:{bookingId},include:{items:true,address:true}});
  if(!row||row.userId!==req.user.id&&req.user.role!=="ADMIN")throw new NotFoundException("Booking not found");
  return {success:true,data:serialize(row)};
 }

 @Post("bookings")
 async createBooking(@Req() req:Caller,@Body() body:Data){
  if(!["CUSTOMER","ADMIN"].includes(req.user.role))throw new ForbiddenException();
  const serviceId=asString(body.serviceId,100),tier=asString(body.tier,20).toLowerCase();
  if(!(tier in tierFactors))throw new BadRequestException("Select valid service tier");
  if(body.paymentMethod && body.paymentMethod!=="COD")
    throw new BadRequestException("Only cash on delivery is currently supported");
  const date=new Date(asString(body.date,40));
  if(!Number.isFinite(date.getTime())||date.getTime()<Date.now()-86400000)
    throw new BadRequestException("Select a valid future booking date");
  const time=asString(body.time,50),area=asString(body.area,150),
        city=asString(body.city,120),division=asString(body.division,120),
        postalCode=asString(body.postalCode,30),areaSize=asString(body.areaSize,100);
  const service=await this.db.service.findUnique({where:{id:serviceId},include:{category:true}});
  if(!service||!service.isActive||!service.category.isActive||Number(service.basePrice)<=0)
    throw new BadRequestException("Selected service is not available for booking");
  const factor=tierFactors[tier]!,base=Number(service.basePrice),
        total=Math.round(base*factor*100)/100;
  const bookingId="BK-"+randomBytes(3).toString("hex").toUpperCase();
  const row=await this.db.order.create({data:{
   bookingId,userId:req.user.id,baseAmount:base,totalAmount:total,
   tier:tier.toUpperCase() as "STANDARD"|"PREMIUM"|"DELUXE",tierMultiplier:factor,
   scheduledDate:date,scheduledTime:time,areaSize,additionalInfo:typeof body.additionalInfo==="string"?body.additionalInfo.slice(0,2000):null,
   paymentMethod:"COD",paymentStatus:"PENDING",status:"PENDING",
   address:{create:{area,city,division,postalCode}},
   items:{create:{serviceId:service.id,serviceName:service.name,unitPrice:total,totalPrice:total,quantity:1}},
   history:{create:{fromStatus:null,toStatus:"PENDING",changedBy:req.user.id,changedByRole:req.user.role}}
  },include:{address:true,items:true}});
  return {success:true,data:{bookingId:row.bookingId,serviceName:service.name,
   tierName:tier[0].toUpperCase()+tier.slice(1),date:date.toISOString().slice(0,10),
   time,address:`${area}, ${city}`,totalPrice:total,status:"pending",paymentMethod:"COD",paymentStatus:"PENDING"}};
 }

 @Patch("bookings/:bookingId/cancel")
 async cancelBooking(@Req() req:Caller,@Param("bookingId") bookingId:string,@Body() body:Data){
  const row=await this.db.order.findUnique({where:{bookingId}});
  if(!row||row.userId!==req.user.id)throw new NotFoundException("Booking not found");
  if(!["PENDING","CONFIRMED"].includes(row.status))
    throw new ConflictException("This booking cannot be cancelled online");
  await this.db.$transaction([
   this.db.order.update({where:{id:row.id},data:{status:"CANCELLED"}}),
   this.db.orderHistory.create({data:{orderId:row.id,fromStatus:row.status,toStatus:"CANCELLED",
     changedBy:req.user.id,changedByRole:req.user.role,
     reason:typeof body?.reason==="string"?body.reason.slice(0,500):"Customer cancellation"}})
  ]);
  return {success:true,message:"Booking cancelled"};
 }

 @Post("bookings/:bookingId/review")
 async reviewBooking(@Req() req:Caller,@Param("bookingId") bookingId:string,@Body() body:Data){
  const order=await this.db.order.findUnique({where:{bookingId}});
  if(!order||order.userId!==req.user.id)throw new NotFoundException("Booking not found");
  if(order.status!=="COMPLETED"||order.rating!==null)
    throw new ConflictException("Review is allowed once after completion");
  const rating=safeInt(body.rating,0,1,5),review=asString(body.review,2000);
  await this.db.order.update({where:{id:order.id},data:{rating,review}});
  return {success:true,message:"Review saved"};
 }

 @Get("technician/jobs")
 async technicianJobs(@Req() req:Caller) {
  ensureStaff(req);
  const rows=await this.db.order.findMany({
   where:{technicianId:req.user.id},include:{items:true,address:true},orderBy:{createdAt:"desc"},take:100
  });
  return {success:true,data:rows.map(serialize)};
 }

 @Get("technician/schedule")
 async technicianSchedule(@Req() req:Caller){
  ensureStaff(req);
  const rows=await this.db.technicianAvailability.findMany({where:{technicianId:req.user.id},orderBy:{dayOfWeek:"asc"}});
  return {success:true,data:rows};
 }

 @Get("technician/profile")
 async technicianProfile(@Req() req:Caller){
  ensureStaff(req);
  const row=await this.db.technicianProfile.findUnique({where:{id:req.user.id}});
  if(!row)throw new NotFoundException("Profile awaiting approval");
  return {success:true,data:{...row,rating:Number(row.rating)}};
 }
}

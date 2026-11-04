import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards,
  Req, BadRequestException, ConflictException, NotFoundException, ForbiddenException
} from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const text = (value: unknown, max = 240): string => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new BadRequestException("Invalid text field");
  return value.trim();
};
const optionalText = (value: unknown, max = 2000): string | null => {
  if (value === undefined || value === null || value === "") return null;
  return text(value, max);
};
const integer = (v: unknown, minimum = 0, max = 100000): number => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < minimum || n > max)
    throw new BadRequestException("Invalid integer field");
  return n;
};
const price = (v: unknown): number => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10000000)
    throw new BadRequestException("Invalid price");
  return Math.round(n * 100) / 100;
};
const admin = (req: {user?: {role?:string}}) => {
  if (req.user?.role !== "ADMIN") throw new ForbiddenException("Administrator access required");
};
type Data = Record<string, unknown>;
const categorySelect = {
  features: { orderBy: { sortOrder: "asc" as const } },
  steps: { orderBy: { stepNumber: "asc" as const } },
  _count: { select: { services: true } }
};
const publicService = (s: any) => ({ ...s, basePrice: Number(s.basePrice) });
const publicCategory = (c: any) => ({
  ...c, services: Array.isArray(c.services) ? c.services.map(publicService) : c.services
});
function features(value: unknown) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 30) throw new BadRequestException("Invalid features");
  return value.map((f: any, i) => ({text: text(f?.text,300),icon:optionalText(f?.icon,80),
    sortOrder: f?.sortOrder===undefined?i:integer(f.sortOrder)}));
}
function steps(value: unknown) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 30) throw new BadRequestException("Invalid steps");
  return value.map((s: any, i) => ({stepNumber:s?.stepNumber===undefined?i+1:integer(s.stepNumber,1),
    title:text(s?.title,180),description:text(s?.description,1000)}));
}
function categoryInput(value: Data, update: boolean) {
  const data: any = {};
  if (!update || value.name !== undefined) data.name = text(value.name,120);
  if (!update || value.slug !== undefined) data.slug = text(value.slug ?? slugify(data.name),120).toLowerCase();
  if (value.description !== undefined) data.description = optionalText(value.description);
  if (value.icon !== undefined) data.icon = optionalText(value.icon,80);
  if (value.sortOrder !== undefined) data.sortOrder = integer(value.sortOrder);
  if (value.isActive !== undefined) {
    if (typeof value.isActive !== "boolean") throw new BadRequestException("Invalid availability");
    data.isActive = value.isActive;
  }
  const fs=features(value.features),ss=steps(value.steps);
  if (fs !== undefined) data.features={ deleteMany:{},create:fs };
  if (ss !== undefined) data.steps={ deleteMany:{},create:ss };
  return data;
}
function serviceInput(value: Data, update: boolean) {
  const data:any = {};
  if (!update || value.categoryId !== undefined) data.categoryId=text(value.categoryId,100);
  if (!update || value.name !== undefined) data.name=text(value.name,160);
  if (!update || value.slug !== undefined) data.slug=text(value.slug ?? slugify(data.name),130).toLowerCase();
  if (value.description !== undefined) data.description=optionalText(value.description);
  if (value.icon !== undefined) data.icon=optionalText(value.icon,80);
  if (!update || value.basePrice !== undefined) data.basePrice=price(value.basePrice);
  if (!update || value.duration !== undefined) data.duration=integer(value.duration,1,100000);
  if (value.sortOrder !== undefined) data.sortOrder=integer(value.sortOrder);
  if (value.isActive !== undefined) {
    if (typeof value.isActive !== "boolean") throw new BadRequestException("Invalid service status");
    data.isActive=value.isActive;
  }
  if (!update && data.basePrice === 0) data.isActive = false;
  if (data.isActive === true && data.basePrice === 0) {
    throw new BadRequestException("Add an approved price before activating this service");
  }
  return data;
}

@Controller("catalog")
export class CatalogController {
  constructor(private readonly db: PrismaService) {}

  @Get("categories")
  async categories(@Query("includeInactive") inactive?:string, @Query("includeServices") includeServices?:string) {
    const rows=await this.db.serviceCategory.findMany({
      where: inactive==="true" ? {} : {isActive:true},
      include:{...categorySelect,services:includeServices==="true"?{orderBy:{sortOrder:"asc" as const}}:false},
      orderBy:[{sortOrder:"asc"},{name:"asc"}]
    });
    return rows.map(publicCategory);
  }

  @Get("categories/by-slug/:slug")
  async categoryBySlug(@Param("slug") slug:string,@Query("includeServices") all?:string) {
    const c=await this.db.serviceCategory.findUnique({
      where:{slug},include:{...categorySelect,services:all==="true"?true:false}
    });
    if(!c)throw new NotFoundException("Category not found");
    return publicCategory(c);
  }

  @Get("categories/:id")
  async categoryById(@Param("id") id:string,@Query("includeServices") all?:string) {
    const c=await this.db.serviceCategory.findUnique({
      where:{id},include:{...categorySelect,services:all==="true"?true:false}
    });
    if(!c)throw new NotFoundException("Category not found");
    return publicCategory(c);
  }

  @Post("categories")
  @UseGuards(JwtAuthGuard)
  async addCategory(@Req() req:any,@Body() data:Data) {
    admin(req);
    const value=categoryInput(data,false);
    if(await this.db.serviceCategory.findFirst({where:{OR:[{name:value.name},{slug:value.slug}]}}))
      throw new ConflictException("Category already exists");
    return publicCategory(await this.db.serviceCategory.create({data:value,include:categorySelect}));
  }

  @Patch("categories/:id")
  @UseGuards(JwtAuthGuard)
  async editCategory(@Req() req:any,@Param("id") id:string,@Body() data:Data) {
    admin(req);
    if(!await this.db.serviceCategory.findUnique({where:{id}}))throw new NotFoundException("Category not found");
    return publicCategory(await this.db.serviceCategory.update({
      where:{id},data:categoryInput(data,true),include:categorySelect
    }));
  }

  @Delete("categories/:id")
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Req() req:any,@Param("id") id:string) {
    admin(req);
    const count=await this.db.service.count({where:{categoryId:id}});
    if(count)throw new ConflictException("Move or archive existing services before deleting a category");
    await this.db.serviceCategory.delete({where:{id}});
    return {success:true};
  }

  @Patch("categories/:id/toggle-active")
  @UseGuards(JwtAuthGuard)
  async toggleCategory(@Req() req:any,@Param("id") id:string) {
    admin(req);
    const c=await this.db.serviceCategory.findUnique({where:{id}});
    if(!c)throw new NotFoundException("Category not found");
    return this.db.serviceCategory.update({where:{id},data:{isActive:!c.isActive},include:categorySelect});
  }

  @Get("search")
  async search(@Query("q") q?:string) {
    const term=(q||"").trim().slice(0,150);
    if(term.length<2)return {categories:[],services:[]};
    const [categories,services]=await Promise.all([
      this.db.serviceCategory.findMany({where:{isActive:true,OR:[{name:{contains:term,mode:"insensitive"}},{description:{contains:term,mode:"insensitive"}}]},take:40}),
      this.db.service.findMany({where:{isActive:true,OR:[{name:{contains:term,mode:"insensitive"}},{description:{contains:term,mode:"insensitive"}}]},include:{category:true},take:80})
    ]);
    return {categories,services:services.map(publicService)};
  }

  @Get("by-category/:categoryId")
  async byCategory(@Param("categoryId") categoryId:string,@Query("includeInactive") inactive?:string) {
    const rows=await this.db.service.findMany({
      where:{categoryId,...(inactive==="true"?{}:{isActive:true})},
      include:{category:true},orderBy:[{sortOrder:"asc"},{name:"asc"}]
    });
    return rows.map(publicService);
  }

  @Get("by-category-slug/:slug")
  async byCategorySlug(@Param("slug") slug:string,@Query("includeInactive") inactive?:string) {
    const rows=await this.db.service.findMany({
      where:{category:{slug},...(inactive==="true"?{}:{isActive:true})},
      include:{category:true},orderBy:[{sortOrder:"asc"},{name:"asc"}]
    });
    return rows.map(publicService);
  }

  @Get("by-slug/:category/:slug")
  async serviceBySlug(@Param("category") category:string,@Param("slug") slug:string) {
    const row=await this.db.service.findFirst({
      where:{slug,category:{slug:category,isActive:true},isActive:true},
      include:{category:{include:{features:true,steps:true}}}
    });
    if(!row)throw new NotFoundException("Service not found");
    return publicService(row);
  }

  @Get()
  async services(@Query("includeInactive") inactive?:string,@Query("includeCategory") withCategory?:string) {
    const rows=await this.db.service.findMany({
      where:inactive==="true"?{}:{isActive:true,category:{isActive:true}},
      include:{category:withCategory==="true"},orderBy:[{sortOrder:"asc"},{name:"asc"}]
    });
    return rows.map(publicService);
  }

  @Get(":id")
  async serviceById(@Param("id") id:string,@Query("includeCategory") withCategory?:string) {
    const row=await this.db.service.findUnique({where:{id},include:{category:withCategory==="true"}});
    if(!row)throw new NotFoundException("Service not found");
    return publicService(row);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addService(@Req() req:any,@Body() body:Data) {
    admin(req);
    const data=serviceInput(body,false);
    const category=await this.db.serviceCategory.findUnique({where:{id:data.categoryId}});
    if(!category)throw new BadRequestException("Category does not exist");
    if(await this.db.service.findUnique({where:{categoryId_slug:{categoryId:data.categoryId,slug:data.slug}}}))
      throw new ConflictException("Service already exists");
    return publicService(await this.db.service.create({data,include:{category:true}}));
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async editService(@Req() req:any,@Param("id") id:string,@Body() body:Data) {
    admin(req);
    const existing=await this.db.service.findUnique({where:{id}});
    if(!existing)throw new NotFoundException("Service not found");
    const data=serviceInput(body,true);
    const resultingPrice=data.basePrice??Number(existing.basePrice);
    if(data.isActive===true&&resultingPrice===0)throw new BadRequestException("Service must have an approved price");
    return publicService(await this.db.service.update({where:{id},data,include:{category:true}}));
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteService(@Req() req:any,@Param("id") id:string) {
    admin(req);
    const references=await this.db.orderItem.count({where:{serviceId:id}});
    if(references>0) {
      await this.db.service.update({where:{id},data:{isActive:false}});
      return {success:true,archived:true};
    }
    await this.db.service.delete({where:{id}});
    return {success:true,deleted:true};
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard)
  async toggleService(@Req() req:any,@Param("id") id:string) {
    admin(req);
    const s=await this.db.service.findUnique({where:{id}});
    if(!s)throw new NotFoundException("Service not found");
    if(!s.isActive&&Number(s.basePrice)<=0)throw new BadRequestException("Set a valid price before publishing");
    return publicService(await this.db.service.update({where:{id},data:{isActive:!s.isActive},include:{category:true}}));
  }
}

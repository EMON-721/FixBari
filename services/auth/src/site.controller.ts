import {
  Controller,Get,Post,Patch,Delete,Param,Body,Req,
  UseGuards,BadRequestException,ForbiddenException,NotFoundException,ConflictException
} from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { randomUUID } from "crypto";

type Data=Record<string,unknown>;
const admin=(req:any)=>{if(req.user?.role!=="ADMIN")throw new ForbiddenException("Admin role required")};
const value=(x:unknown,max=4000)=>{
  if(typeof x!=="string"||!x.trim()||x.length>max)throw new BadRequestException("Invalid field");
  return x.trim();
};
const keyPattern=/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,150}$/;
const validateKey=(k:unknown)=>{
  const str=value(k,152);
  if(!keyPattern.test(str))throw new BadRequestException("Invalid content key");
  return str;
};
const roleValue=(x:unknown)=>{
  if(!["ADMIN","CUSTOMER","TECHNICIAN"].includes(String(x)))throw new BadRequestException("Invalid account role");
  return String(x);
};
const validateHref=(x:unknown)=>{
 const href=value(x,160);
 // Custom page URLs must remain in the owner's own role-restricted website.
 if(!/^\/content\/[a-z0-9][a-z0-9-]{1,70}$/.test(href))throw new BadRequestException("Use a local /content/slug page");
 return href;
};

@Controller("site")
export class SiteController {
  constructor(private readonly db:PrismaService) {}

  @Get("public-content")
  async publicContent(){
    const rows=await this.db.$queryRaw<{key:string;section:string;value:string}[]>`
      SELECT key,section,value FROM site_content WHERE published = TRUE ORDER BY section,key`;
    return {success:true,data:rows};
  }

  @Get("content")
  @UseGuards(JwtAuthGuard)
  async content(@Req() req:any){
    admin(req);
    const rows=await this.db.$queryRaw<{key:string;section:string;value:string;published:boolean}[]>`
      SELECT key,section,value,published FROM site_content ORDER BY section,key`;
    return {success:true,data:rows};
  }

  @Post("content")
  @UseGuards(JwtAuthGuard)
  async createContent(@Req() req:any,@Body() body:Data){
    admin(req);
    const key=validateKey(body.key),section=value(body.section,120),content=value(body.value,4000);
    const published=body.published===undefined?true:body.published;
    if(typeof published!=="boolean")throw new BadRequestException("Invalid published status");
    const old=await this.db.$queryRaw<{key:string}[]>`SELECT key FROM site_content WHERE key=${key}`;
    if(old.length)throw new ConflictException("Content key already exists");
    await this.db.$executeRaw`
      INSERT INTO site_content(key,section,value,published,updated_at,updated_by)
      VALUES(${key},${section},${content},${published},NOW(),${req.user.id})`;
    return {success:true,data:{key,section,value:content,published}};
  }

  @Patch("content/:key")
  @UseGuards(JwtAuthGuard)
  async editContent(@Req() req:any,@Param("key") rawKey:string,@Body() body:Data){
    admin(req);
    const key=validateKey(rawKey),old=await this.db.$queryRaw<{key:string}[]>`
      SELECT key FROM site_content WHERE key=${key}`;
    if(!old.length)throw new NotFoundException("Content entry not found");
    const fields:any={};
    if(body.value!==undefined)fields.value=value(body.value,4000);
    if(body.section!==undefined)fields.section=value(body.section,120);
    if(body.published!==undefined){
      if(typeof body.published!=="boolean")throw new BadRequestException("Invalid publish state");
      fields.published=body.published;
    }
    if(!Object.keys(fields).length)throw new BadRequestException("No changes supplied");
    await this.db.$executeRaw`
      UPDATE site_content SET
        section=COALESCE(${fields.section??null},section),
        value=COALESCE(${fields.value??null},value),
        published=COALESCE(${fields.published??null},published),
        updated_at=NOW(),updated_by=${req.user.id}
      WHERE key=${key}`;
    return {success:true,data:{key,...fields}};
  }

  @Delete("content/:key")
  @UseGuards(JwtAuthGuard)
  async deleteContent(@Req() req:any,@Param("key") rawKey:string){
    admin(req);const key=validateKey(rawKey);
    const n=await this.db.$executeRaw`DELETE FROM site_content WHERE key=${key}`;
    if(n===0)throw new NotFoundException("Content entry not found");
    return {success:true};
  }

  @Get("settings")
  @UseGuards(JwtAuthGuard)
  async settings(@Req() req:any){
    admin(req);
    const entries=await this.db.$queryRaw<{key:string;value:any}[]>`SELECT key,value FROM site_settings ORDER BY key`;
    return {success:true,data:Object.fromEntries(entries.map(e=>[e.key,e.value]))};
  }

  @Patch("settings/general")
  @UseGuards(JwtAuthGuard)
  async saveGeneral(@Req() req:any,@Body() body:Data){
    admin(req);
    const siteName=value(body.siteName,100);
    const email=body.supportEmail?value(body.supportEmail,180):"";
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new BadRequestException("Invalid support email");
    const phone=body.supportPhone?value(body.supportPhone,35):"";
    if(phone&&!/^[+0-9() .-]{7,35}$/.test(phone))
      throw new BadRequestException("Invalid support number");
    const data={siteName,supportEmail:email,supportPhone:phone,currency:"BDT",codOnly:true};
    const serialized=JSON.stringify(data);
    await this.db.$executeRaw`
      INSERT INTO site_settings(key,value,updated_at,updated_by)
      VALUES('general',${serialized}::jsonb,NOW(),${req.user.id})
      ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by`;
    return {success:true,data};
  }

  @Get("navigation")
  @UseGuards(JwtAuthGuard)
  async navigation(@Req() req:any){
    admin(req);
    const rows=await this.db.$queryRaw<any[]>`
      SELECT id,role,label,href,section,sort_order AS "sortOrder",
      is_visible AS "isVisible" FROM site_navigation ORDER BY role,sort_order,label`;
    return {success:true,data:rows};
  }

  @Post("navigation")
  @UseGuards(JwtAuthGuard)
  async createNavigation(@Req() req:any,@Body() body:Data){
    admin(req);
    const role=roleValue(body.role),label=value(body.label,100),href=validateHref(body.href);
    const section=body.section?value(body.section,100):"Custom";
    const order=Number(body.sortOrder??100);
    if(!Number.isInteger(order)||order<0||order>10000)throw new BadRequestException("Invalid order");
    const id=randomUUID();
    const old=await this.db.$queryRaw<any[]>`SELECT id FROM site_navigation WHERE role=${role} AND href=${href}`;
    if(old.length)throw new ConflictException("Navigation link already exists");
    await this.db.$executeRaw`
      INSERT INTO site_navigation(id,role,label,href,section,sort_order,is_visible,updated_at,updated_by)
      VALUES(${id},${role},${label},${href},${section},${order},TRUE,NOW(),${req.user.id})`;
    return {success:true,data:{id,role,label,href,section,sortOrder:order,isVisible:true}};
  }

  @Patch("navigation/:id")
  @UseGuards(JwtAuthGuard)
  async editNavigation(@Req() req:any,@Param("id") id:string,@Body() body:Data){
    admin(req);
    const old=await this.db.$queryRaw<any[]>`SELECT id,role,label,href,section,sort_order AS "sortOrder",is_visible AS "isVisible" FROM site_navigation WHERE id=${id}`;
    if(!old.length)throw new NotFoundException("Navigation not found");
    const current=old[0];
    const role=body.role!==undefined?roleValue(body.role):current.role;
    const label=body.label!==undefined?value(body.label,100):current.label;
    const href=body.href!==undefined?validateHref(body.href):current.href;
    const section=body.section!==undefined?value(body.section,100):current.section;
    const order=body.sortOrder!==undefined?Number(body.sortOrder):current.sortOrder;
    if(!Number.isInteger(order)||order<0||order>10000)throw new BadRequestException("Invalid order");
    const visible=body.isVisible===undefined?current.isVisible:body.isVisible;
    if(typeof visible!=="boolean")throw new BadRequestException("Invalid visibility");
    await this.db.$executeRaw`
      UPDATE site_navigation SET role=${role},label=${label},href=${href},section=${section},
      sort_order=${order},is_visible=${visible},updated_at=NOW(),updated_by=${req.user.id} WHERE id=${id}`;
    return {success:true,data:{id,role,label,href,section,sortOrder:order,isVisible:visible}};
  }

  @Delete("navigation/:id")
  @UseGuards(JwtAuthGuard)
  async deleteNavigation(@Req() req:any,@Param("id") id:string){
    admin(req);
    const n=await this.db.$executeRaw`DELETE FROM site_navigation WHERE id=${id}`;
    if(n===0)throw new NotFoundException("Navigation not found");
    return {success:true};
  }

  @Get("public-settings")
  async publicSettings(){
    const rows=await this.db.$queryRaw<{value:any}[]>`SELECT value FROM site_settings WHERE key='general'`;
    return {success:true,data:rows[0]?.value||{siteName:"FixBari",currency:"BDT",codOnly:true}};
  }
}

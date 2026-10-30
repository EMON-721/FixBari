import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@local-services/database";

interface CreateUserDto {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.authUser.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.authUser.findUnique({
      where: { id },
    });
  }

  async listPublicDirectory() {
    return this.prisma.authUser.findMany({
      select:{id:true,email:true,firstName:true,lastName:true,phone:true,role:true,isActive:true,createdAt:true,emailVerified:true},
      orderBy:{createdAt:"desc"},take:200,
    });
  }

  async updateMyPublicProfile(id:string, data:Record<string,string>) {
    // Explicit property names avoid unintended Prisma data updates.
    const update = {
      ...(data.firstName !== undefined && {firstName:data.firstName}),
      ...(data.lastName !== undefined && {lastName:data.lastName}),
      ...(data.phone !== undefined && {phone:data.phone}),
      ...(data.address !== undefined && {address:data.address}),
      ...(data.area !== undefined && {area:data.area}),
      ...(data.city !== undefined && {city:data.city}),
      ...(data.division !== undefined && {division:data.division}),
      ...(data.postalCode !== undefined && {postalCode:data.postalCode}),
    };
    return this.prisma.authUser.update({where:{id},data:update,select:{id:true,email:true,firstName:true,lastName:true,phone:true,address:true,area:true,city:true,division:true,postalCode:true,emailVerified:true,createdAt:true}});
  }

  async setActiveStatus(id:string,isActive:boolean) {
    const updated = await this.prisma.authUser.updateMany({
      where:{id},data:{isActive}
    });
    if (updated.count !== 1) return null;
    if (!isActive) await this.prisma.authSession.deleteMany({where:{userId:id}});
    return this.prisma.authUser.findUnique({where:{id},select:{id:true,isActive:true}});
  }

  async create(data: CreateUserDto) {
    return this.prisma.authUser.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
      },
    });
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    return this.prisma.authUser.update({
      where: { id },
      data,
    });
  }
}

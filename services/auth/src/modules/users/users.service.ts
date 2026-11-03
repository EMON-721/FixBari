import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
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
      select:{id:true,customerNumber:true,email:true,firstName:true,lastName:true,phone:true,role:true,isActive:true,createdAt:true,emailVerified:true},
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
    return this.prisma.authUser.update({where:{id},data:update,select:{id:true,customerNumber:true,email:true,firstName:true,lastName:true,phone:true,address:true,area:true,city:true,division:true,postalCode:true,emailVerified:true,createdAt:true}});
  }

  async setActiveStatus(id:string,isActive:boolean) {
    const updated = await this.prisma.authUser.updateMany({
      where:{id},data:{isActive}
    });
    if (updated.count !== 1) return null;
    if (!isActive) await this.prisma.authSession.deleteMany({where:{userId:id}});
    return this.prisma.authUser.findUnique({where:{id},select:{id:true,isActive:true}});
  }

  async getTechnicianApplication(userId: string) {
    return this.prisma.technicianApplication.findUnique({
      where: { userId },
      select: {
        id: true, technicianNumber: true, status: true,
        serviceAreas: true, specializations: true,
        experience: true, createdAt: true, reviewedAt: true,
      },
    });
  }

  async listTechnicianApplications() {
    return this.prisma.technicianApplication.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, technicianNumber: true, status: true, serviceAreas: true,
        specializations: true, experience: true, createdAt: true, reviewedAt: true,
        user: { select: { id: true, firstName: true, lastName: true,
          email: true, phone: true, isActive: true, role: true } },
      },
    });
  }

  async reviewTechnicianApplication(id: string, decision: "APPROVED" | "REJECTED", adminId: string) {
    return this.prisma.$transaction(async tx => {
      const application = await tx.technicianApplication.findUnique({
        where: { id }, include: { user: true },
      });
      if (!application) throw new NotFoundException("Technician application not found");
      if (application.status !== "PENDING") {
        throw new ConflictException("This application was already reviewed");
      }
      if (!application.user.isActive || application.user.role !== UserRole.CUSTOMER) {
        throw new ConflictException("Applicant account is not eligible");
      }
      // Conditional update prevents concurrent approvals and duplicate promotions.
      const changed = await tx.technicianApplication.updateMany({
        where: { id, status: "PENDING" },
        data: { status: decision, reviewedBy: adminId, reviewedAt: new Date() },
      });
      if (changed.count !== 1) throw new ConflictException("Application was already reviewed");

      if (decision === "APPROVED") {
        await tx.authUser.update({
          where: { id: application.userId },
          data: { role: UserRole.TECHNICIAN },
        });
        await tx.technicianProfile.create({
          data: {
            id: application.userId,
            firstName: application.user.firstName,
            lastName: application.user.lastName,
            phone: application.user.phone,
            specializations: application.specializations,
            serviceAreas: application.serviceAreas,
            verificationStatus: "VERIFIED",
            // Admin enables job availability only after reviewing service areas.
            isAvailable: false,
          },
        });
        // Force new login with a freshly minted TECHNICIAN token.
        await tx.authSession.deleteMany({ where: { userId: application.userId } });
      }
      return tx.technicianApplication.findUnique({
        where: { id },
        select: { id: true, technicianNumber: true, status: true, reviewedAt: true },
      });
    });
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

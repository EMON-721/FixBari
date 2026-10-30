import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminRoleGuard } from "../../common/guards/admin-role.guard";

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(
    @Query("includeInactive") includeInactive?: string,
    @Query("includeCategory") includeCategory?: string
  ) {
    return this.servicesService.findAll({
      includeInactive: includeInactive === "true",
      includeCategory: includeCategory === "true",
    });
  }

  @Get("search")
  async search(@Query("q") query: string) {
    return this.servicesService.search(query);
  }

  @Get("by-category/:categoryId")
  async findByCategory(
    @Param("categoryId") categoryId: string,
    @Query("includeInactive") includeInactive?: string
  ) {
    return this.servicesService.findByCategory(categoryId, {
      includeInactive: includeInactive === "true",
    });
  }

  @Get("by-category-slug/:categorySlug")
  async findByCategorySlug(
    @Param("categorySlug") categorySlug: string,
    @Query("includeInactive") includeInactive?: string
  ) {
    return this.servicesService.findByCategorySlug(categorySlug, {
      includeInactive: includeInactive === "true",
    });
  }

  @Get("by-slug/:categorySlug/:serviceSlug")
  async findBySlug(
    @Param("categorySlug") categorySlug: string,
    @Param("serviceSlug") serviceSlug: string
  ) {
    return this.servicesService.findBySlug(categorySlug, serviceSlug);
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Query("includeCategory") includeCategory?: string
  ) {
    return this.servicesService.findOne(id, {
      includeCategory: includeCategory === "true",
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async update(
    @Param("id") id: string,
    @Body() updateServiceDto: UpdateServiceDto
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    return this.servicesService.remove(id);
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async toggleActive(@Param("id") id: string) {
    return this.servicesService.toggleActive(id);
  }
}

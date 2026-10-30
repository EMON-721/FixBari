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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminRoleGuard } from "../../common/guards/admin-role.guard";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(
    @Query("includeInactive") includeInactive?: string,
    @Query("includeServices") includeServices?: string
  ) {
    return this.categoriesService.findAll({
      includeInactive: includeInactive === "true",
      includeServices: includeServices === "true",
    });
  }

  @Get("by-slug/:slug")
  async findBySlug(
    @Param("slug") slug: string,
    @Query("includeServices") includeServices?: string
  ) {
    return this.categoriesService.findBySlug(slug, {
      includeServices: includeServices === "true",
    });
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Query("includeServices") includeServices?: string
  ) {
    return this.categoriesService.findOne(id, {
      includeServices: includeServices === "true",
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    return this.categoriesService.remove(id);
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async toggleActive(@Param("id") id: string) {
    return this.categoriesService.toggleActive(id);
  }
}

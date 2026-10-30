import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RabbitMQService } from "../../rabbitmq/rabbitmq.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async findAll(options: {
    includeInactive?: boolean;
    includeServices?: boolean;
  }) {
    const where = options.includeInactive ? {} : { isActive: true };

    return this.prisma.serviceCategory.findMany({
      where,
      include: {
        services: options.includeServices
          ? { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }
          : false,
        features: { orderBy: { sortOrder: "asc" } },
        steps: { orderBy: { stepNumber: "asc" } },
        _count: { select: { services: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async findOne(id: string, options: { includeServices?: boolean }) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        services: options.includeServices
          ? { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }
          : false,
        features: { orderBy: { sortOrder: "asc" } },
        steps: { orderBy: { stepNumber: "asc" } },
        _count: { select: { services: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || this.generateSlug(dto.name);

    // Check for duplicate slug
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(
        `Category with slug "${slug}" already exists`
      );
    }

    // Check for duplicate name
    const existingName = await this.prisma.serviceCategory.findUnique({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`
      );
    }

    const category = await this.prisma.serviceCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        features: dto.features
          ? {
              create: dto.features.map((f, index) => ({
                text: f.text,
                icon: f.icon,
                sortOrder: f.sortOrder ?? index,
              })),
            }
          : undefined,
        steps: dto.steps
          ? {
              create: dto.steps.map((s) => ({
                stepNumber: s.stepNumber,
                title: s.title,
                description: s.description,
              })),
            }
          : undefined,
      },
      include: {
        features: { orderBy: { sortOrder: "asc" } },
        steps: { orderBy: { stepNumber: "asc" } },
      },
    });

    // Publish event
    await this.rabbitmq.publishCategoryCreated({
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
    });

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.findOne(id, { includeServices: false });

    // Check for slug conflict if slug is being updated
    if (dto.slug && dto.slug !== existing.slug) {
      const duplicate = await this.prisma.serviceCategory.findUnique({
        where: { slug: dto.slug },
      });
      if (duplicate) {
        throw new ConflictException(
          `Category with slug "${dto.slug}" already exists`
        );
      }
    }

    // Check for name conflict if name is being updated
    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.serviceCategory.findUnique({
        where: { name: dto.name },
      });
      if (duplicate) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`
        );
      }
    }

    const { features, steps, ...categoryData } = dto;

    const changes = Object.keys(dto).filter(
      (key) => dto[key as keyof UpdateCategoryDto] !== undefined
    );

    // Use transaction to update category and replace features/steps
    const category = await this.prisma.$transaction(async (tx) => {
      // Delete existing features if new ones provided
      if (features !== undefined) {
        await tx.categoryFeature.deleteMany({ where: { categoryId: id } });
      }

      // Delete existing steps if new ones provided
      if (steps !== undefined) {
        await tx.categoryStep.deleteMany({ where: { categoryId: id } });
      }

      // Update category with new features and steps
      return tx.serviceCategory.update({
        where: { id },
        data: {
          ...categoryData,
          features:
            features !== undefined
              ? {
                  create: features.map((f, index) => ({
                    text: f.text,
                    icon: f.icon,
                    sortOrder: f.sortOrder ?? index,
                  })),
                }
              : undefined,
          steps:
            steps !== undefined
              ? {
                  create: steps.map((s) => ({
                    stepNumber: s.stepNumber,
                    title: s.title,
                    description: s.description,
                  })),
                }
              : undefined,
        },
        include: {
          features: { orderBy: { sortOrder: "asc" } },
          steps: { orderBy: { stepNumber: "asc" } },
        },
      });
    });

    // Publish event
    await this.rabbitmq.publishCategoryUpdated({
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      changes,
    });

    return category;
  }

  async remove(id: string) {
    const category = await this.findOne(id, { includeServices: false });

    await this.prisma.serviceCategory.delete({ where: { id } });

    // Publish event
    await this.rabbitmq.publishCategoryDeleted({
      categoryId: category.id,
      name: category.name,
    });
  }

  async toggleActive(id: string) {
    const category = await this.findOne(id, { includeServices: false });
    return this.update(id, { isActive: !category.isActive });
  }

  async findBySlug(slug: string, options: { includeServices?: boolean }) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug },
      include: {
        services: options.includeServices
          ? {
              where: { isActive: true },
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            }
          : false,
        features: { orderBy: { sortOrder: "asc" } },
        steps: { orderBy: { stepNumber: "asc" } },
        _count: { select: { services: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }
}

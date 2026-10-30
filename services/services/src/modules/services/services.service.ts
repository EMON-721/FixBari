import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RabbitMQService } from "../../rabbitmq/rabbitmq.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
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
    includeCategory?: boolean;
  }) {
    const where = options.includeInactive ? {} : { isActive: true };

    return this.prisma.service.findMany({
      where,
      include: {
        category: options.includeCategory,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async findByCategory(
    categoryId: string,
    options: { includeInactive?: boolean }
  ) {
    const where = options.includeInactive
      ? { categoryId }
      : { categoryId, isActive: true };

    return this.prisma.service.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async findOne(id: string, options: { includeCategory?: boolean }) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: options.includeCategory,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async create(dto: CreateServiceDto) {
    // Verify category exists
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with ID ${dto.categoryId} not found`
      );
    }

    const slug = dto.slug || this.generateSlug(dto.name);

    // Check for duplicate slug within category
    const existing = await this.prisma.service.findFirst({
      where: { categoryId: dto.categoryId, slug },
    });
    if (existing) {
      throw new ConflictException(
        `Service with slug "${slug}" already exists in this category`
      );
    }

    const service = await this.prisma.service.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon,
        basePrice: dto.basePrice,
        duration: dto.duration,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        category: true,
      },
    });

    // Publish event
    await this.rabbitmq.publishServiceCreated({
      serviceId: service.id,
      categoryId: service.categoryId,
      name: service.name,
      slug: service.slug,
      basePrice: Number(service.basePrice),
      duration: service.duration,
      isActive: service.isActive,
    });

    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.findOne(id, { includeCategory: false });

    // If changing category, verify it exists
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.serviceCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category with ID ${dto.categoryId} not found`
        );
      }
    }

    // Check for slug conflict if slug or category is being updated
    const targetCategoryId = dto.categoryId || existing.categoryId;
    const targetSlug = dto.slug || existing.slug;

    if (dto.slug || dto.categoryId) {
      const duplicate = await this.prisma.service.findFirst({
        where: {
          categoryId: targetCategoryId,
          slug: targetSlug,
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(
          `Service with slug "${targetSlug}" already exists in this category`
        );
      }
    }

    const changes = Object.keys(dto).filter(
      (key) => dto[key as keyof UpdateServiceDto] !== undefined
    );

    const service = await this.prisma.service.update({
      where: { id },
      data: dto,
      include: {
        category: true,
      },
    });

    // Publish event
    await this.rabbitmq.publishServiceUpdated({
      serviceId: service.id,
      categoryId: service.categoryId,
      name: service.name,
      slug: service.slug,
      basePrice: Number(service.basePrice),
      duration: service.duration,
      isActive: service.isActive,
      changes,
    });

    return service;
  }

  async remove(id: string) {
    const service = await this.findOne(id, { includeCategory: false });

    await this.prisma.service.delete({ where: { id } });

    // Publish event
    await this.rabbitmq.publishServiceDeleted({
      serviceId: service.id,
      categoryId: service.categoryId,
      name: service.name,
    });
  }

  async toggleActive(id: string) {
    const service = await this.findOne(id, { includeCategory: false });
    return this.update(id, { isActive: !service.isActive });
  }

  async findByCategorySlug(
    categorySlug: string,
    options: { includeInactive?: boolean }
  ) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with slug "${categorySlug}" not found`
      );
    }

    const where = options.includeInactive
      ? { categoryId: category.id }
      : { categoryId: category.id, isActive: true };

    return this.prisma.service.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async findBySlug(categorySlug: string, serviceSlug: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with slug "${categorySlug}" not found`
      );
    }

    const service = await this.prisma.service.findFirst({
      where: {
        categoryId: category.id,
        slug: serviceSlug,
        isActive: true,
      },
      include: {
        category: {
          include: {
            features: { orderBy: { sortOrder: "asc" } },
            steps: { orderBy: { stepNumber: "asc" } },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(
        `Service with slug "${serviceSlug}" not found in category "${categorySlug}"`
      );
    }

    return service;
  }

  async search(query: string) {
    if (!query || query.trim().length < 2) {
      return { categories: [], services: [] };
    }

    const searchTerm = query.trim().toLowerCase();

    const [categories, services] = await Promise.all([
      this.prisma.serviceCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          features: { orderBy: { sortOrder: "asc" } },
          steps: { orderBy: { stepNumber: "asc" } },
          _count: { select: { services: true } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.service.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);

    return { categories, services };
  }
}

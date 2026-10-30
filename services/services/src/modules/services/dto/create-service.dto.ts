import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
  Min,
} from "class-validator";

export class CreateServiceDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsInt()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

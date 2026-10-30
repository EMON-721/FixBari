import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateFeatureDto } from "./create-feature.dto";
import { CreateStepDto } from "./create-step.dto";

export class CreateCategoryDto {
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
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureDto)
  features?: CreateFeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps?: CreateStepDto[];
}

import { IsString, IsOptional, IsInt, MaxLength } from "class-validator";

export class CreateFeatureDto {
  @IsString()
  @MaxLength(200)
  text: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

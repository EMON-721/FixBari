import { IsString, IsInt, MaxLength, Min } from "class-validator";

export class CreateStepDto {
  @IsInt()
  @Min(1)
  stepNumber: number;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(500)
  description: string;
}

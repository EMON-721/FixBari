import { IsEmail, IsString, MinLength, IsOptional, IsIn, Matches, MaxLength, IsArray, ArrayMaxSize } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,128}$/, { message: "Password must contain uppercase, lowercase and a number" })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string;

  @IsString()
  @Matches(/^(?:\+8801|01)[3-9]\d{8}$/, { message: "Enter a valid Bangladeshi mobile number" })
  phone: string;

  @IsOptional()
  @IsIn(["CUSTOMER", "TECHNICIAN"])
  role?: "CUSTOMER" | "TECHNICIAN";

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  serviceAreas?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  experience?: string;
}

import { IsEmail, IsString, MinLength, IsOptional, IsIn, Matches, MaxLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
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
}

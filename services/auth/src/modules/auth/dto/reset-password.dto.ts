import { IsString, MinLength, IsUUID } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @IsUUID("4", { message: "Invalid reset token" })
  token: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;
}

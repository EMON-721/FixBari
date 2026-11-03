import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class OwnerSetupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,128}$/, {
    message: "Admin password must contain uppercase, lowercase and a digit",
  })
  password: string;

  @IsString()
  @MinLength(32)
  @MaxLength(256)
  setupSecret: string;
}

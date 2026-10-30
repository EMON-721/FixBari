import { IsString, MinLength } from "class-validator";
export class GoogleLoginDto {
  @IsString()
  @MinLength(50)
  credential: string;
}

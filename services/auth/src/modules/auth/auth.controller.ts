import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("google")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.credential);
  }

  @Post("refresh")
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post("logout")
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Request() req: { user: { id: string; email: string; role: string } }) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      return req.user;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      address: user.address,
      area: user.area,
      city: user.city,
      division: user.division,
      postalCode: user.postalCode,
      createdAt: user.createdAt,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    };
  }

  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post("reset-password")
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMyProfile(@Request() req: {user:{id:string}}, @Body() body:Record<string,unknown>) {
    const allowed = ["firstName","lastName","phone","address","area","city","division","postalCode"] as const;
    const data: Record<string,string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (typeof body[key] !== "string" || body[key].length > 150 || (key === "firstName" || key === "lastName") && !body[key].trim()) {
          throw new ForbiddenException(`Invalid field: ${key}`);
        }
        data[key] = body[key] as string;
      }
    }
    return {success:true,data:await this.usersService.updateMyPublicProfile(req.user.id,data)};
  }

  // Admin-only account directory; do not expose password hashes or reset tokens.
  @UseGuards(JwtAuthGuard)
  @Get("admin/users")
  async adminUsers(@Request() req: {user:{role:string}}) {
    if (req.user.role !== "ADMIN") throw new ForbiddenException();
    return { success:true, data: await this.usersService.listPublicDirectory() };
  }

  @UseGuards(JwtAuthGuard)
  @Post("admin/users/:id/status")
  async adminSetUserStatus(@Request() req: {user:{role:string,id:string}}, @Param("id") id:string, @Body() body:{isActive:boolean}) {
    if (req.user.role !== "ADMIN") throw new ForbiddenException();
    if (req.user.id === id && body?.isActive === false) throw new ForbiddenException("Cannot suspend your own account");
    if (typeof body?.isActive !== "boolean") throw new ForbiddenException("Invalid requested status");
    return {success:true, data:await this.usersService.setActiveStatus(id,body.isActive)};
  }

  @Get("validate-reset-token/:token")
  async validateResetToken(@Param("token") token: string) {
    return this.authService.validateResetToken(token);
  }
}

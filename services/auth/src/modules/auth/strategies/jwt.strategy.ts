import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";

interface JwtPayload {
  tokenUse: "access" | "refresh";
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.tokenUse !== "access" || !payload.sub) {
      throw new UnauthorizedException("Access token required");
    }
    // Always use the current account status and role, not stale JWT claims.
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Account disabled or unavailable");
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

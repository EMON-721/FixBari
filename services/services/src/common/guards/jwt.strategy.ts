import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

interface JwtPayload {
  tokenUse: "access" | "refresh";
  sub: string;
  email: string;
  role: string;
  mfa?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.tokenUse !== "access") throw new UnauthorizedException("Access token required");
    if (payload.role === "ADMIN" && process.env.REQUIRE_ADMIN_MFA === "true" && payload.mfa !== true) throw new UnauthorizedException("Admin MFA required");
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

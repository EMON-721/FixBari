import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { verifyGoogleIdToken } from "./verify-google-token";
import { decryptTotpSecret, encryptTotpSecret, matchingTotpStep, newTotpSecret, totpUri } from "./admin-totp";
import { UserRole } from "@local-services/database";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    const normalizedEmail = registerDto.email.trim().toLowerCase();
    const normalizedPhone = registerDto.phone.startsWith("+880") ? registerDto.phone : `+88${registerDto.phone}`;
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: normalizedEmail,
      passwordHash,
      firstName: registerDto.firstName.trim(),
      lastName: registerDto.lastName.trim(),
      phone: normalizedPhone,
      role: registerDto.role === "TECHNICIAN" ? UserRole.TECHNICIAN : UserRole.CUSTOMER,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        customerNumber: user.customerNumber,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email.trim().toLowerCase(), loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is disabled");
    }

    let mfaVerified = false;
    if (user.role === UserRole.ADMIN) {
      const mfa = await this.prisma.adminMfa.findUnique({where:{userId:user.id}});
      if (mfa?.enabled) {
        if (!loginDto.otpCode) throw new UnauthorizedException("Authenticator code required");
        const step = matchingTotpStep(decryptTotpSecret(mfa.secretCipher),loginDto.otpCode);
        if (step === null) throw new UnauthorizedException("Invalid authenticator code");
        const updated = await this.prisma.adminMfa.updateMany({
          where:{id:mfa.id,lastUsedStep:{lt:BigInt(step)}},data:{lastUsedStep:BigInt(step)}
        });
        if (updated.count !== 1) throw new UnauthorizedException("Authenticator code already used");
        mfaVerified = true;
      }
    }
    const tokens = await this.generateTokens(user, mfaVerified);

    return {
      user: {id:user.id,customerNumber:user.customerNumber,email:user.email,firstName:user.firstName,lastName:user.lastName,role:user.role},
      ...tokens,
    };
  }

  /** Google Identity Services ID tokens are verified server-side for audience,
   * issuer and signature. Email alone must not automatically link existing users. */
  async loginWithGoogle(credential: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new UnauthorizedException("Google sign-in is not configured");
    let payload;
    try {
      payload = await verifyGoogleIdToken(credential, clientId);
    } catch {
      throw new UnauthorizedException("Invalid Google credential");
    }
    if (!payload?.sub || !payload.email || payload.email_verified !== true ||
        !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss ?? "")) {
      throw new UnauthorizedException("Google account is not verified");
    }
    const email = payload.email.trim().toLowerCase();
    const bySub = await this.prisma.authUser.findUnique({ where: { googleSub: payload.sub } });
    if (bySub && bySub.email !== email) {
      throw new UnauthorizedException("Google account email has changed; contact support");
    }
    let user = bySub;
    if (!user) {
      // Prevent account takeover by matching only on verified email.
      const byEmail = await this.prisma.authUser.findUnique({ where: { email } });
      if (byEmail) {
        throw new ConflictException("An account with this email exists. Sign in with your password to link an account.");
      }
      const names = (payload.name ?? "Customer").trim().split(/\s+/);
      try {
        user = await this.prisma.authUser.create({
          data: {
            email,
            googleSub: payload.sub,
            passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
            firstName: payload.given_name || names[0] || "Customer",
            lastName: payload.family_name || names.slice(1).join(" ") || "Account",
            emailVerified: true,
            avatar: payload.picture || null,
            role: UserRole.CUSTOMER,
          },
        });
      } catch {
        throw new ConflictException("Account already exists; retry sign-in or contact support");
      }
    }
    if (!user.isActive || user.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException("Google sign-in is available to active customer accounts only");
    }
    return {
      user: {
        id: user.id, email: user.email, firstName: user.firstName,
        lastName: user.lastName, role: user.role,
        emailVerified: user.emailVerified, avatar: user.avatar,
      },
      ...await this.generateTokens(user),
    };
  }

  private async generateTokens(user: { id: string; email: string; role: string }, mfaVerified = false) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      mfa: mfaVerified,
    };

    const accessToken = this.jwtService.sign({ ...payload, tokenUse: "access" }, { expiresIn: "15m" });
    const refreshToken = this.jwtService.sign({ ...payload, tokenUse: "refresh", jti: crypto.randomUUID() }, { expiresIn: "30d" });
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.authSession.create({ data: {
      userId: user.id, refreshToken: tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    } });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15-minute access token; refresh token expires after 30 days
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.tokenUse !== "refresh") throw new UnauthorizedException("Invalid refresh token type");
      const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      const session = await this.prisma.authSession.findFirst({where:{userId:payload.sub,refreshToken:hash,expiresAt:{gt:new Date()}}});
      if (!session) throw new UnauthorizedException("Session expired or revoked");
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException();
      }

      const revoked = await this.prisma.authSession.deleteMany({where:{id:session.id,refreshToken:hash}});
      if (revoked.count !== 1) throw new UnauthorizedException("Refresh token already used");
      if (user.role === UserRole.ADMIN) {
        const mfa = await this.prisma.adminMfa.findUnique({where:{userId:user.id}});
        if (mfa?.enabled && payload.mfa !== true) throw new UnauthorizedException("Admin MFA required");
      }
      return this.generateTokens(user,payload.mfa === true);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async setupAdminMfa(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive || user.role !== UserRole.ADMIN) throw new UnauthorizedException();
    const prior = await this.prisma.adminMfa.findUnique({where:{userId}});
    if (prior?.enabled) throw new ConflictException("MFA already enabled");
    const secret = newTotpSecret();
    const secretCipher = encryptTotpSecret(secret);
    await this.prisma.adminMfa.upsert({
      where:{userId},update:{secretCipher,lastUsedStep:BigInt(-1)},create:{userId,secretCipher}
    });
    return {otpAuthUrl:totpUri(secret,user.email)};
  }

  async confirmAdminMfa(userId:string,code:string) {
    const mfa = await this.prisma.adminMfa.findUnique({where:{userId}});
    if (!mfa || mfa.enabled) throw new UnauthorizedException("MFA setup unavailable");
    const step = matchingTotpStep(decryptTotpSecret(mfa.secretCipher),code);
    if (step === null) throw new UnauthorizedException("Invalid authenticator code");
    const updated = await this.prisma.adminMfa.updateMany({
      where:{id:mfa.id,enabled:false},data:{enabled:true,lastUsedStep:BigInt(step)}
    });
    if(updated.count !== 1) throw new UnauthorizedException("MFA setup already completed");
    await this.prisma.authSession.deleteMany({where:{userId}});
    return {enabled:true};
  }

  async logout(refreshToken: string) {
    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.authSession.deleteMany({where:{refreshToken:hash}});
    return {success:true};
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: "If the email exists, a reset link will be sent." };
    }

    // Invalidate any existing reset tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Never log password reset tokens. An authenticated delivery integration
    // must be configured before enabling customer-facing reset email flows.

    return { message: "If the email exists, a reset link will be sent." };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }

    if (resetToken.usedAt) {
      throw new UnauthorizedException("Reset token has already been used");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Reset token has expired");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and mark token as used
    await this.prisma.$transaction([
      this.prisma.authSession.deleteMany({where:{userId:resetToken.userId}}),
      this.prisma.authUser.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: "Password has been reset successfully" };
  }

  async validateResetToken(token: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return { valid: false };
    }

    return { valid: true };
  }
}

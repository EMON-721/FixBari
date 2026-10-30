import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

/** Run after JwtAuthGuard; only authenticated ADMIN tokens may mutate catalog data. */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.role !== "ADMIN") {
      throw new ForbiddenException("Administrator permission required");
    }
    return true;
  }
}

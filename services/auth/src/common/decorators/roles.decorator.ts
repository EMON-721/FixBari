import { SetMetadata } from "@nestjs/common";

export type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

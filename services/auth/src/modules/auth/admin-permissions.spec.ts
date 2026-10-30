import { ForbiddenException } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

describe("Admin account permission boundaries", () => {
  let controller: AuthController;
  const users = {
    setActiveStatus: jest.fn(async (id: string, active: boolean) => ({id, isActive: active})),
    listPublicDirectory: jest.fn(async () => [{id:"admin-2",role:"ADMIN",isActive:true}]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController({} as AuthService, users as unknown as UsersService);
  });

  it("allows an authorized admin to manage another admin account", async () => {
    const response = await controller.adminSetUserStatus({user:{id:"admin-1",role:"ADMIN"}},"admin-2",{isActive:false});
    expect(response).toEqual({success:true,data:{id:"admin-2",isActive:false}});
    expect(users.setActiveStatus).toHaveBeenCalledWith("admin-2",false);
  });

  it("rejects customer attempts to change account status", async () => {
    await expect(controller.adminSetUserStatus({user:{id:"customer",role:"CUSTOMER"}},"admin-2",{isActive:false})).rejects.toBeInstanceOf(ForbiddenException);
    expect(users.setActiveStatus).not.toHaveBeenCalled();
  });

  it("prevents an admin from suspending their own account", async () => {
    await expect(controller.adminSetUserStatus({user:{id:"admin-1",role:"ADMIN"}},"admin-1",{isActive:false})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects malformed active flags", async () => {
    await expect(controller.adminSetUserStatus({user:{id:"admin-1",role:"ADMIN"}},"admin-2",{isActive:"false" as unknown as boolean})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows admin-only directory access", async () => {
    await expect(controller.adminUsers({user:{role:"CUSTOMER"}})).rejects.toBeInstanceOf(ForbiddenException);
    expect(await controller.adminUsers({user:{role:"ADMIN"}})).toEqual({success:true,data:[{id:"admin-2",role:"ADMIN",isActive:true}]});
  });
});

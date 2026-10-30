import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { JwtStrategy } from "../../common/guards/jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, JwtStrategy],
  exports: [CategoriesService],
})
export class CategoriesModule {}

import { Router } from "express";
import { query, param } from "express-validator";
import { getServices, getServiceById } from "../controllers/services";

export const servicesRouter = Router();

servicesRouter.get(
  "/",
  [
    query("category").optional().isString(),
    query("active").optional().isBoolean(),
  ],
  getServices
);

servicesRouter.get(
  "/:id",
  [param("id").isUUID()],
  getServiceById
);

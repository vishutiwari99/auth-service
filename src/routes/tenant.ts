import express, { NextFunction, Request, Response } from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { Tenant } from "../entity/Tenant";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../contants";
import { tenantsValidator } from "../validators/tenants-validator";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

router.post(
  "/",
  tenantsValidator,
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.create(req, res, next);
  },
);
router.get(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.getAll(req, res, next);
  },
);
router.get(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.getOneById(req, res, next);
  },
);

router.put(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.updateTenant(req, res, next);
  },
);

router.delete(
  "/:id",

  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.deleteTenant(req, res, next);
  },
);

export default router;

import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      const { name, address } = req.body;

      this.logger.debug(
        `Request to create tenant with name ${name} and address ${address}`,
      );
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info(`Tenant created with id ${tenant.id}`);
      return res.status(201).json({ id: tenant.id });
    } catch (error) {
      next(error);
      return;
    }
  }
  async getAll(req: CreateTenantRequest, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.getAllTenants();
      return res.status(200).json(tenant);
    } catch (error) {
      next(error);
      return;
    }
  }

  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.getOneById(Number(req.params.id));
      if (!tenant) {
        const error = createHttpError(404, "Tenant not found");
        next(error);
        return;
      }
      return res.status(200).json(tenant);
    } catch (error) {
      next(error);
      return;
    }
  }

  async updateTenant(
    req: CreateTenantRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const tenant = await this.tenantService.getOneById(Number(req.params.id));
      if (!tenant) {
        const error = createHttpError(404, "Tenant not found");
        next(error);
        return;
      }
      const { name, address } = req.body;
      const id = Number(req.params.id);
      await this.tenantService.update(id, {
        name,
        address,
      });
      this.logger.info(`Tenant with id ${id} updated`);
      return res.status(200).send();
    } catch (error) {
      next(error);
      return;
    }
  }
  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = Number(req.params.id);

      const tenant = await this.tenantService.getOneById(tenantId);
      if (!tenant) {
        const error = createHttpError(404, "Tenant not found");
        next(error);
        return;
      }
      await this.tenantService.delete(tenantId);
      this.logger.info(`Tenant with id ${tenantId} updated`);
      return res.status(200).send();
    } catch (error) {
      next(error);
      return;
    }
  }
}

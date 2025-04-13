import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
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
}

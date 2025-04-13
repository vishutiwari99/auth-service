import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async create(tenant: ITenant) {
    return await this.tenantRepository.save(tenant);
  }

  async getAllTenants() {
    return await this.tenantRepository.find();
  }

  async getOneById(id: number) {
    return await this.tenantRepository.find({
      where: { id },
    });
  }

  async update(id: number, tenant: ITenant) {
    return await this.tenantRepository.update(id, tenant);
  }
  async delete(id: number) {
    return await this.tenantRepository.delete({
      id: id,
    });
  }
}

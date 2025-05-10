import { Brackets, Repository } from "typeorm";
import { ITenant, TenantQueryParams } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
  constructor(private readonly tenantRepository: Repository<Tenant>) {}
  async create(tenant: ITenant) {
    return await this.tenantRepository.save(tenant);
  }

  async getAllTenants(validatedQuery: TenantQueryParams) {
    const querBuilder = this.tenantRepository.createQueryBuilder("tenant");
    if (validatedQuery.q) {
      const searchQuery = `%${validatedQuery.q}%`;
      querBuilder.where(
        new Brackets((qb) => {
          qb.where(
            "CONCAT(tenant.name, ' ', tenant.address) ILike :searchQuery",
            {
              searchQuery,
            },
          );
        }),
      );
    }

    const result = await querBuilder
      .orderBy("tenant.createdAt", "DESC")
      .getManyAndCount();
    return result;
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

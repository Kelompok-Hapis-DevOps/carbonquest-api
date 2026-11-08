import { OrganizationDTO } from "../types/index.js";
import { OrganizationRepository } from "../repositories/organization.repository.js";
import { AppError } from "../middleware/error.middleware.js";
import bcrypt from "bcryptjs";

export class OrganizationService {
  private repository: OrganizationRepository;

  constructor(repository: OrganizationRepository = new OrganizationRepository()) {
    this.repository = repository;
  }

  async getAllOrganizations(): Promise<Omit<OrganizationDTO, "password">[]> {
    const orgs = await this.repository.findAll();
    return orgs.map(({ password, ...org }) => org);
  }

  async updatePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const org = await this.repository.findById(id);

    if (!org) {
      throw new AppError("Organization not found", 404);
    }

    if (!org.password) {
      throw new AppError("Invalid organization data", 500);
    }

    const isValid = await bcrypt.compare(oldPassword, org.password);
    if (!isValid) {
      throw new AppError("Invalid old password", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(id, hashed);
  }
}

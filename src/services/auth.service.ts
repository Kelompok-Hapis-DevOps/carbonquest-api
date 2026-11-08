import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  CreateOrganizationDTO,
  CreateUserDTO,
  LoginDTO,
  OrganizationDTO,
  UserDTO,
} from "../types/index.js";
import { OrganizationRepository } from "../repositories/organization.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

export class AuthService {
  private userRepository: UserRepository;
  private organizationRepository: OrganizationRepository;

  constructor(
    userRepository: UserRepository = new UserRepository(),
    organizationRepository: OrganizationRepository = new OrganizationRepository()
  ) {
    this.userRepository = userRepository;
    this.organizationRepository = organizationRepository;
  }

  async registerUser(data: CreateUserDTO): Promise<{ user: Omit<UserDTO, "password">; token: string }> {
    this.validateRegistration(data.email, data.password, data.name);

    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const user = await this.userRepository.create({
      ...data,
      birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
      password: await this.hashPassword(data.password),
      profile_image: "",
    });

    return {
      user: this.excludePassword(user),
      token: generateToken({ sub: user.id_user, role: "user" }),
    };
  }

  async loginUser(data: LoginDTO): Promise<{ user: Omit<UserDTO, "password">; token: string }> {
    this.validateLogin(data.email, data.password);

    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !(await this.verifyPassword(data.password, user.password!))) {
      throw new AppError("Invalid email or password", 401);
    }

    return {
      user: this.excludePassword(user),
      token: generateToken({ sub: user.id_user, role: "user" }),
    };
  }

  async registerOrganization(data: CreateOrganizationDTO): Promise<{ org: Omit<OrganizationDTO, "password">; token: string }> {
    this.validateRegistration(data.email, data.password, data.name);

    const existingOrg = await this.organizationRepository.findByEmail(data.email);
    if (existingOrg) {
      throw new AppError("Email already exists", 400);
    }

    const org = await this.organizationRepository.create({
      ...data,
      password: await this.hashPassword(data.password),
    });

    return {
      org: this.excludeOrgPassword(org),
      token: generateToken({ sub: org.id_organisasi, role: "org" }),
    };
  }

  async loginOrganization(data: LoginDTO): Promise<{ org: Omit<OrganizationDTO, "password">; token: string }> {
    this.validateLogin(data.email, data.password);

    const org = await this.organizationRepository.findByEmail(data.email);
    if (!org || !(await this.verifyPassword(data.password, org.password!))) {
      throw new AppError("Invalid email or password", 401);
    }

    return {
      org: this.excludeOrgPassword(org),
      token: generateToken({ sub: org.id_organisasi, role: "org" }),
    };
  }

  private validateRegistration(email?: string, password?: string, name?: string): void {
    if (!email || !password || !name) {
      throw new AppError("Name, email, and password are required", 400);
    }
  }

  private validateLogin(email?: string, password?: string): void {
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }

  private excludePassword(user: UserDTO): Omit<UserDTO, "password"> {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private excludeOrgPassword(org: OrganizationDTO): Omit<OrganizationDTO, "password"> {
    const { password: _, ...orgWithoutPassword } = org;
    return orgWithoutPassword;
  }
}

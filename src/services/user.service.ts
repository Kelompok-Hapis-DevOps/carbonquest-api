import { AppError } from "../middleware/error.middleware.js";
import { CreateUserDTO, UserDTO } from "../types/index.js";
import { UserRepository } from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";

export class UserService {
  private repository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this.repository = repository;
  }

  async getAllUsers(): Promise<UserDTO[]> {
    return await this.repository.findAll();
  }

  async getUserById(id: number): Promise<Omit<UserDTO, "password">> {
    const user = await this.findUserOrThrow(id);
    return this.excludePassword(user);
  }

  async getLeaderboard(): Promise<any[]> {
    return await this.repository.getLeaderboard();
  }

  async updatePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findUserOrThrow(id);

    if (!user.password) {
      throw new AppError("Invalid user data", 500);
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new AppError("Invalid old password", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(id, hashed);
  }

  async updateUser(
    id: number,
    data: Partial<Omit<UserDTO, "id_user" | "password">>
  ): Promise<Omit<UserDTO, "password">> {
    await this.findUserOrThrow(id);
    const updatedUser = await this.repository.update(id, data as Partial<CreateUserDTO>);
    return this.excludePassword(updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    await this.findUserOrThrow(id);
    await this.repository.delete(id);
  }

  async updateProfileImage(id: number, profileImage: string): Promise<Omit<UserDTO, "password">> {
    await this.findUserOrThrow(id);
    const updatedUser = await this.repository.update(id, { profile_image: profileImage });
    return this.excludePassword(updatedUser);
  }

  private async findUserOrThrow(id: number): Promise<UserDTO> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  private excludePassword(user: UserDTO): Omit<UserDTO, "password"> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

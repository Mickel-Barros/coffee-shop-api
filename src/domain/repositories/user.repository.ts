import { User } from '../entities/user.entity.js';
import { Role } from '../enums/role.enum.js';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(input: {
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<void>;
}

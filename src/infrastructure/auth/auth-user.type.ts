import { Role } from '../../domain/enums/role.enum.js';

export interface AuthUser {
  userId: string;
  role: Role;
}

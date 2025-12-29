import { Roles } from '../../auth/roles.decorator.js';
import { Role } from '../../../domain/enums/role.enum.js';

export const ManagerOnly = () => Roles(Role.MANAGER);

export const CustomerOrManager = () => Roles(Role.CUSTOMER, Role.MANAGER);

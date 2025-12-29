import { PaginationDto } from '../../infrastructure/http/dtos/pagination.dto.js';
import { AuthUser } from '../../infrastructure/auth/auth-user.type.js';
import { Role } from '../../domain/enums/role.enum.js';

export class OrderQueryMapper {
  static toListQuery(pagination: PaginationDto, user: AuthUser) {
    return {
      page: pagination.page,
      limit: pagination.limit,
      userId: user.role === Role.MANAGER ? undefined : user.userId,
    };
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../../../domain/enums/role.enum.js';
import { GetOrderUseCase } from '../../../application/use-cases/get-order.usecase.js';

@Injectable()
export class OrderOwnershipGuard implements CanActivate {
  constructor(private readonly getOrder: GetOrderUseCase) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const orderId = req.params.id;

    const order = await this.getOrder.execute(orderId);
    req.order = order;

    if (user.role === Role.MANAGER) return true;

    if (order.userId !== user.userId) {
      throw new ForbiddenException('You can only access your own orders');
    }

    return true;
  }
}

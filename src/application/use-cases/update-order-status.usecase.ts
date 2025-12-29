import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '../../domain/enums/order-status.enum.js';
import { PrismaOrderRepository } from '../../infrastructure/prisma/prisma-order.repository.js';
import { NotificationService } from '../services/notification.service.js';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: PrismaOrderRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(orderId: string, newStatus: OrderStatus) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.validateStatusTransition(order.status as OrderStatus, newStatus);

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      newStatus,
    );

    const notificationResponse =
      await this.notificationService.notify(newStatus);

    console.log('Notification response:', notificationResponse);

    return updatedOrder;
  }

  private validateStatusTransition(current: OrderStatus, next: OrderStatus) {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      [OrderStatus.WAITING]: OrderStatus.PREPARATION,
      [OrderStatus.PREPARATION]: OrderStatus.READY,
      [OrderStatus.READY]: OrderStatus.DELIVERED,
      [OrderStatus.DELIVERED]: null,
    };

    if (flow[current] !== next) {
      throw new BadRequestException(
        `Invalid status transition: ${current} → ${next}`,
      );
    }
  }
}

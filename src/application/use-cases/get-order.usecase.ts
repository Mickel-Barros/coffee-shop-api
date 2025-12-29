import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaOrderRepository } from '../../infrastructure/prisma/prisma-order.repository.js';

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly orderRepository: PrismaOrderRepository) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findByIdWithItems(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repository.js';
import { PrismaOrderRepository } from '../../infrastructure/prisma/prisma-order.repository.js'; // ajuste o caminho conforme necessário

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(PrismaOrderRepository)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: { page: number; limit: number; userId?: string }) {
    const skip = (input.page - 1) * input.limit;

    const [data, total] = await Promise.all([
      this.orderRepository.findMany({
        skip,
        take: input.limit,
        userId: input.userId,
      }),
      this.orderRepository.count({
        userId: input.userId,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }
}

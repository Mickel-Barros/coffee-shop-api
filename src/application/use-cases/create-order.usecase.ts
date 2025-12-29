import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '../../domain/enums/order-status.enum.js';
import { MENU } from '../../shared/catalog/menu.js';

import { PaymentService } from '../services/payment.service.js';
import { PrismaOrderRepository } from '../../infrastructure/prisma/prisma-order.repository.js';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: PrismaOrderRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async execute(input: {
    userId: string;
    items: { product: string; variation: string }[];
  }) {
    let total = 0;

    const detailedItems = input.items.map((item) => {
      const product = MENU.find((p) => p.product === item.product);

      if (!product) {
        throw new BadRequestException(`Invalid product: ${item.product}`);
      }

      const variation = product.variations.find(
        (v) => v.name === item.variation,
      );

      if (!variation) {
        throw new BadRequestException(`Invalid variation for ${item.product}`);
      }

      const price = product.basePrice + variation.price;
      total += price;

      return {
        product: item.product,
        variation: item.variation,
        price,
      };
    });
    console.log('total');

    console.log(total);
    const paymentResponse = await this.paymentService.pay(total);

    console.log('Payment response:', paymentResponse);

    if (!paymentResponse.success) {
      throw new BadRequestException('Payment failed');
    }

    return this.orderRepository.create({
      userId: input.userId,
      items: detailedItems,
      total,
      status: OrderStatus.WAITING,
    });
  }
}

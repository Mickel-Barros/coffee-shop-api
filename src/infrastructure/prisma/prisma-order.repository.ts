import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { OrderStatus } from '../../domain/enums/order-status.enum.js';

@Injectable()
export class PrismaOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    items: {
      product: string;
      variation: string;
      price: number;
    }[];
    total: number;
    status: OrderStatus;
  }) {
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        total: data.total,
        status: data.status,
        items: {
          create: data.items.map((item) => ({
            product: item.product,
            variation: item.variation,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
    });
  }

  async findByIdWithItems(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
      },
    });
  }
  async findMany(input: { skip: number; take: number; userId?: string }) {
    return this.prisma.order.findMany({
      where: input.userId ? { userId: input.userId } : undefined,
      skip: input.skip,
      take: input.take,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async count(input: { userId?: string }) {
    return this.prisma.order.count({
      where: input.userId ? { userId: input.userId } : undefined,
    });
  }
}

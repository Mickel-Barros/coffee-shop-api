import { Order } from '../entities/order.entity.js';
import { OrderStatus } from '../enums/order-status.enum.js';

export interface OrderRepository {
  create(data: {
    userId: string;
    items: {
      product: string;
      variation: string;
      price: number;
    }[];
    total: number;
    status: OrderStatus;
  }): Promise<Order>;

  findById(orderId: string): Promise<Order | null>;

  findByIdWithItems(orderId: string): Promise<Order | null>;

  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;

  findMany(input: {
    skip: number;
    take: number;
    userId?: string;
  }): Promise<Order[]>;

  count(input: { userId?: string }): Promise<number>;
}

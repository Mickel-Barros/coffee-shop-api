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
  }): Promise<any>;

  findById(orderId: string): Promise<any | null>;

  findByIdWithItems(orderId: string): Promise<any | null>;

  updateStatus(orderId: string, status: OrderStatus): Promise<any>;

  findMany(input: {
    skip: number;
    take: number;
    userId?: string;
  }): Promise<any[]>;

  count(input: { userId?: string }): Promise<number>;
}

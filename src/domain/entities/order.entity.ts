import { OrderStatus } from '../enums/order-status.enum.js';

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: OrderStatus,
    public readonly total: number,
    public readonly createdAt: Date,
  ) {}
}

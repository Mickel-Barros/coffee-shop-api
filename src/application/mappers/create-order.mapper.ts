import { CreateOrderDto } from '../../infrastructure/http/dtos/create-order.dto.js';

export class CreateOrderMapper {
  static toCommand(dto: CreateOrderDto, userId: string) {
    return {
      userId,
      items: dto.items.map((item) => ({
        product: item.product.trim(),
        variation: item.variation.trim(),
      })),
    };
  }
}

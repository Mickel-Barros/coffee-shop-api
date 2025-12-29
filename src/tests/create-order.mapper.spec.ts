import { CreateOrderMapper } from '../application/mappers/create-order.mapper';
import { CreateOrderDto } from '../infrastructure/http/dtos/create-order.dto';

describe('CreateOrderMapper', () => {
  it('should map CreateOrderDto to command correctly', () => {
    const dto: CreateOrderDto = {
      items: [
        { product: '  Cappuccino  ', variation: ' Large ' },
        { product: 'Croissant', variation: 'Small' },
      ],
    };
    const userId = 'user-uuid';

    const command = CreateOrderMapper.toCommand(dto, userId);

    expect(command.userId).toBe(userId);
    expect(command.items).toEqual([
      { product: 'Cappuccino', variation: 'Large' },
      { product: 'Croissant', variation: 'Small' },
    ]);
  });

  it('should handle empty items array', () => {
    const dto: CreateOrderDto = { items: [] };
    const userId = 'user-uuid';

    const command = CreateOrderMapper.toCommand(dto, userId);

    expect(command.userId).toBe(userId);
    expect(command.items).toEqual([]);
  });
});

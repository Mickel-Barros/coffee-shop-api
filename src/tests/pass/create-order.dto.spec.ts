import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from '../../infrastructure/http/dtos/create-order.dto';

describe('CreateOrderDto validation', () => {
  it('valid payload passes validation', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      items: [{ product: 'cappuccino', variation: 'large' }],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('missing items fails with custom message', async () => {
    const dto = plainToInstance(CreateOrderDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const itemsError = errors[0];
    expect(itemsError.property).toBe('items');
    expect(itemsError.constraints).toHaveProperty(
      'isNotEmpty',
      'Order must contain at least one item',
    );
  });

  it('invalid item fields produce nested validation errors', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      items: [
        { product: '', variation: 'large' },
        { product: 'cappuccino', variation: '' },
      ],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const itemsError = errors[0];
    expect(itemsError.property).toBe('items');
    expect(itemsError.children).toHaveLength(2);

    // Primeiro item: product vazio
    const firstItem = itemsError.children![0];
    expect(firstItem.property).toBe('0');
    const productError = firstItem.children!.find(
      (c) => c.property === 'product',
    );
    expect(productError).toBeDefined();
    expect(productError!.constraints!.isNotEmpty).toBe(
      'product should not be empty',
    );

    const secondItem = itemsError.children![1];
    expect(secondItem.property).toBe('1');
    const variationError = secondItem.children!.find(
      (c) => c.property === 'variation',
    );
    expect(variationError).toBeDefined();
    expect(variationError!.constraints!.isNotEmpty).toBe(
      'variation should not be empty',
    );
  });
});

import { BadRequestException } from '@nestjs/common';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.usecase';
import { OrderStatus } from '../../domain/enums/order-status.enum';

describe('CreateOrderUseCase', () => {
  const makeSut = () => {
    const orderRepository = {
      create: jest.fn(),
    };

    const paymentService = {
      pay: jest.fn(),
    };

    const sut = new CreateOrderUseCase(
      orderRepository as any,
      paymentService as any,
    );

    return { sut, orderRepository, paymentService };
  };

  it('creates an order when items are valid and payment succeeds', async () => {
    const { sut, orderRepository, paymentService } = makeSut();

    const userId = 'user-1';
    const items = [
      { product: 'Latte', variation: 'Vanilla' },
      { product: 'Espresso', variation: 'Double Shot' },
    ];

    const expectedTotal = 4.3 + 3.5;

    paymentService.pay.mockResolvedValue({ success: true, id: 'tx-1' });

    const createdOrder = {
      id: 'order-1',
      userId,
      items: [
        { product: 'Latte', variation: 'Vanilla', price: 4.3 },
        { product: 'Espresso', variation: 'Double Shot', price: 3.5 },
      ],
      total: expectedTotal,
      status: OrderStatus.WAITING,
    };

    orderRepository.create.mockResolvedValue(createdOrder);

    const result = await sut.execute({ userId, items });

    expect(paymentService.pay).toHaveBeenCalledWith(expectedTotal);
    expect(orderRepository.create).toHaveBeenCalledWith({
      userId,
      items: createdOrder.items,
      total: expectedTotal,
      status: OrderStatus.WAITING,
    });

    expect(result).toEqual(createdOrder);
  });

  it('throws BadRequestException when product is invalid', async () => {
    const { sut } = makeSut();

    await expect(
      sut.execute({
        userId: 'u',
        items: [{ product: 'Unknown', variation: 'X' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when variation is invalid for a product', async () => {
    const { sut } = makeSut();

    await expect(
      sut.execute({
        userId: 'u',
        items: [{ product: 'Latte', variation: 'Nope' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when payment fails', async () => {
    const { sut, paymentService } = makeSut();

    paymentService.pay.mockResolvedValue({ success: false });

    await expect(
      sut.execute({
        userId: 'u',
        items: [{ product: 'Latte', variation: 'Vanilla' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

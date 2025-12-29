import { NotFoundException } from '@nestjs/common';
import { GetOrderUseCase } from '../../application/use-cases/get-order.usecase';

describe('GetOrderUseCase', () => {
  const makeSut = () => {
    const orderRepository = {
      findByIdWithItems: jest.fn(),
    };

    const sut = new GetOrderUseCase(orderRepository as any);

    return { sut, orderRepository };
  };

  it('returns an order when found', async () => {
    const { sut, orderRepository } = makeSut();

    const orderId = 'order-1';
    const foundOrder = {
      id: orderId,
      userId: 'user-1',
      items: [{ product: 'Latte', variation: 'Vanilla', price: 4.3 }],
      total: 4.3,
      status: 'WAITING',
    };

    orderRepository.findByIdWithItems.mockResolvedValue(foundOrder);

    const result = await sut.execute(orderId);

    expect(orderRepository.findByIdWithItems).toHaveBeenCalledWith(orderId);
    expect(result).toEqual(foundOrder);
  });

  it('throws NotFoundException when order is not found', async () => {
    const { sut, orderRepository } = makeSut();

    orderRepository.findByIdWithItems.mockResolvedValue(null);

    await expect(sut.execute('missing-id')).rejects.toThrow(NotFoundException);
  });
});

import { ListOrdersUseCase } from '../application/use-cases/list-orders.usecase';

describe('ListOrdersUseCase', () => {
  const makeSut = () => {
    const orderRepository = {
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const sut = new ListOrdersUseCase(orderRepository as any);

    return { sut, orderRepository };
  };

  it('returns paginated data and meta', async () => {
    const { sut, orderRepository } = makeSut();

    const data = [
      { id: 'o3', userId: 'u1', total: 5 },
      { id: 'o4', userId: 'u1', total: 6 },
    ];

    orderRepository.findMany.mockResolvedValue(data);
    orderRepository.count.mockResolvedValue(5);

    const result = await sut.execute({ page: 2, limit: 2 });

    expect(orderRepository.findMany).toHaveBeenCalledWith({
      skip: 2,
      take: 2,
      userId: undefined,
    });
    expect(orderRepository.count).toHaveBeenCalledWith({ userId: undefined });

    expect(result).toEqual({
      data,
      meta: {
        total: 5,
        page: 2,
        limit: 2,
        totalPages: 3,
      },
    });
  });

  it('passes userId to repository and handles zero results', async () => {
    const { sut, orderRepository } = makeSut();

    orderRepository.findMany.mockResolvedValue([]);
    orderRepository.count.mockResolvedValue(0);

    const result = await sut.execute({ page: 1, limit: 10, userId: 'user-1' });

    expect(orderRepository.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      userId: 'user-1',
    });
    expect(orderRepository.count).toHaveBeenCalledWith({ userId: 'user-1' });

    expect(result.meta.totalPages).toBe(0);
    expect(result.data).toEqual([]);
  });
});

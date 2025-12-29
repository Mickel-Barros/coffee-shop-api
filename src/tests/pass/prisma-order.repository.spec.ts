// src/tests/prisma-order.repository.spec.ts

import { PrismaOrderRepository } from '../../infrastructure/prisma/prisma-order.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OrderStatus } from '../../domain/enums/order-status.enum';

describe('PrismaOrderRepository', () => {
  let repository: PrismaOrderRepository;
  let prismaService: any;

  const mockOrder = {
    id: 'order-123',
    userId: 'user-456',
    total: 29.9,
    status: OrderStatus.WAITING,
    createdAt: new Date(),
    items: [
      { id: 'item-1', product: 'Espresso', variation: 'Double', price: 4.5 },
      { id: 'item-2', product: 'Croissant', variation: 'Plain', price: 25.4 },
    ],
  };

  beforeEach(() => {
    prismaService = {
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    repository = new PrismaOrderRepository(prismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with items', async () => {
      prismaService.order.create.mockResolvedValue(mockOrder);

      const result = await repository.create({
        userId: 'user-456',
        total: 29.9,
        status: OrderStatus.WAITING,
        items: [
          { product: 'Espresso', variation: 'Double', price: 4.5 },
          { product: 'Croissant', variation: 'Plain', price: 25.4 },
        ],
      });

      expect(prismaService.order.create).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findById', () => {
    it('should find order by ID', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await repository.findById('order-123');

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findByIdWithItems', () => {
    it('should find order by ID including items', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await repository.findByIdWithItems('order-123');

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        include: { items: true },
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      prismaService.order.update.mockResolvedValue(mockOrder);

      const result = await repository.updateStatus(
        'order-123',
        OrderStatus.DELIVERED,
      );

      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: OrderStatus.DELIVERED },
        include: { items: true },
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findMany', () => {
    it('should find many orders with user filter', async () => {
      prismaService.order.findMany.mockResolvedValue([mockOrder]);

      const result = await repository.findMany({
        skip: 0,
        take: 10,
        userId: 'user-456',
      });

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-456' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should find many orders without user filter', async () => {
      prismaService.order.findMany.mockResolvedValue([mockOrder]);

      const result = await repository.findMany({ skip: 0, take: 10 });

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('count', () => {
    it('should count orders with user filter', async () => {
      prismaService.order.count.mockResolvedValue(42);

      const result = await repository.count({ userId: 'user-456' });

      expect(prismaService.order.count).toHaveBeenCalledWith({
        where: { userId: 'user-456' },
      });
      expect(result).toBe(42);
    });

    it('should count all orders without filter', async () => {
      prismaService.order.count.mockResolvedValue(100);

      const result = await repository.count({});

      expect(prismaService.order.count).toHaveBeenCalledWith({
        where: undefined,
      });
      expect(result).toBe(100);
    });
  });
});

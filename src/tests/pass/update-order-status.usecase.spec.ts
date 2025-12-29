import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.usecase';
import { OrderStatus } from '../../domain/enums/order-status.enum';

describe('UpdateOrderStatusUseCase', () => {
  const makeSut = () => {
    const orderRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const notificationService = {
      notify: jest.fn(),
    };

    const sut = new UpdateOrderStatusUseCase(
      orderRepository as any,
      notificationService as any,
    );

    return { sut, orderRepository, notificationService };
  };

  it('updates the order status and sends a notification when transition is valid', async () => {
    const { sut, orderRepository, notificationService } = makeSut();

    const orderId = 'order-1';
    const existingOrder = { id: orderId, status: OrderStatus.WAITING };

    const updatedOrder = { id: orderId, status: OrderStatus.PREPARATION };

    orderRepository.findById.mockResolvedValue(existingOrder);
    orderRepository.updateStatus.mockResolvedValue(updatedOrder);
    notificationService.notify.mockResolvedValue({ success: true });

    const result = await sut.execute(orderId, OrderStatus.PREPARATION);

    expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(
      orderId,
      OrderStatus.PREPARATION,
    );
    expect(notificationService.notify).toHaveBeenCalledWith(
      OrderStatus.PREPARATION,
    );
    expect(result).toEqual(updatedOrder);
  });

  it('throws NotFoundException when order does not exist', async () => {
    const { sut, orderRepository } = makeSut();

    orderRepository.findById.mockResolvedValue(null);

    await expect(sut.execute('nope', OrderStatus.PREPARATION)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException when transition is invalid', async () => {
    const { sut, orderRepository, notificationService } = makeSut();

    const orderId = 'order-2';
    const existingOrder = { id: orderId, status: OrderStatus.WAITING };

    orderRepository.findById.mockResolvedValue(existingOrder);

    // invalid transition WAITING -> READY
    await expect(sut.execute(orderId, OrderStatus.READY)).rejects.toThrow(
      BadRequestException,
    );

    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
    expect(notificationService.notify).not.toHaveBeenCalled();
  });

  it('propagates notification errors after update', async () => {
    const { sut, orderRepository, notificationService } = makeSut();

    const orderId = 'order-3';
    const existingOrder = { id: orderId, status: OrderStatus.PREPARATION };
    const updatedOrder = { id: orderId, status: OrderStatus.READY };

    orderRepository.findById.mockResolvedValue(existingOrder);
    orderRepository.updateStatus.mockResolvedValue(updatedOrder);
    notificationService.notify.mockRejectedValue(
      new InternalServerErrorException('notify failed'),
    );

    await expect(sut.execute(orderId, OrderStatus.READY)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(orderRepository.updateStatus).toHaveBeenCalledWith(
      orderId,
      OrderStatus.READY,
    );
    expect(notificationService.notify).toHaveBeenCalledWith(OrderStatus.READY);
  });
});

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { OrderStatus } from '../../domain/enums/order-status.enum.js';
import { Order } from '../../domain/entities/order.entity.js';

@Injectable()
export class NotificationService {
  private readonly NOTIFICATION_URL =
    'https://challenge.trio.dev/api/v1/notification';

  async notify(status: OrderStatus): Promise<Order> {
    try {
      const response = await axios.post(this.NOTIFICATION_URL, {
        status,
      });
      console.log('Notification service full response:', response.data);

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;

      console.error(
        'Notification service error:',
        axiosError?.response?.data || axiosError?.message || error,
      );

      throw new InternalServerErrorException(
        'Notification service unavailable',
      );
    }
  }
}

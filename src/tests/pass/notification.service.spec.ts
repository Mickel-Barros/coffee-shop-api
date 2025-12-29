import { NotificationService } from '../../application/services/notification.service';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('should call axios.post with correct URL and payload', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await service.notify(OrderStatus.PREPARATION);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://challenge.trio.dev/api/v1/notification',
      { status: OrderStatus.PREPARATION },
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should throw InternalServerErrorException on axios error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Network error'));

    await expect(service.notify(OrderStatus.READY)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});

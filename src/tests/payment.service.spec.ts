import { PaymentService } from '../application/services/payment.service';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return payment response on success', async () => {
    const mockResponse = { success: true, transactionId: 'abc123' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await service.pay(100);
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://challenge.trio.dev/api/v1/payment',
      { value: 100 },
    );
  });

  it('should throw InternalServerErrorException on failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.pay(100)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});

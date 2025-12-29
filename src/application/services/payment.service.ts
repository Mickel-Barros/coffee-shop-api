import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

interface PaymentResponse {
  id: string;
  status: string;
  success: boolean;
  amount: number;
}

@Injectable()
export class PaymentService {
  private readonly PAYMENT_URL = 'https://challenge.trio.dev/api/v1/payment';

  async pay(amount: number): Promise<PaymentResponse> {
    try {
      const response = await axios.post(this.PAYMENT_URL, {
        value: amount,
      });

      console.log('Payment service full response:', response.data);

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        'Payment service error:',
        axiosError?.response?.data || error,
      );

      throw new InternalServerErrorException('Payment service unavailable');
    }
  }
}

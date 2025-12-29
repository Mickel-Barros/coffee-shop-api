import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../domain/enums/order-status.enum.js';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'The new status to set for the order',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    example: OrderStatus.PREPARATION,
  })
  @IsEnum(OrderStatus, {
    message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  status!: OrderStatus;
}

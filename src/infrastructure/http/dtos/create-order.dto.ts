import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({
    description: 'Product ID or code (e.g., menu item identifier)',
    example: 'cappuccino',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  product!: string;

  @ApiProperty({
    description:
      'Variation of the product (e.g., "large", "with oat milk", "no sugar")',
    example: 'large',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  variation!: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of items the customer wants to order',
    type: [OrderItemDto],
    minItems: 1,
    example: [
      {
        product: 'cappuccino',
        variation: 'large',
      },
      {
        product: 'croissant',
        variation: 'plain',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Order must contain at least one item' })
  items!: OrderItemDto[];
}

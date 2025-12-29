import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/jwt.auth-guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import {
  ManagerOnly,
  CustomerOrManager,
} from '../decorators/roles.decorators.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';

import { CreateOrderUseCase } from '../../../application/use-cases/create-order.usecase.js';
import { GetOrderUseCase } from '../../../application/use-cases/get-order.usecase.js';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/update-order-status.usecase.js';
import { ListOrdersUseCase } from '../../../application/use-cases/list-orders.usecase.js';

import { CreateOrderDto } from '../dtos/create-order.dto.js';
import { UpdateStatusDto } from '../dtos/update-status.dto.js';
import { PaginationDto } from '../dtos/pagination.dto.js';

import { CreateOrderMapper } from '../../../application/mappers/create-order.mapper.js';
import { OrderQueryMapper } from '../../../application/mappers/order-query.mapper.js';

import { OrderOwnershipGuard } from '../guards/order-ownership.guard.js';
import { ApiAuthResponses } from '../decorators/swagger-decorator.js';

import { AuthUser } from '../../auth/auth-user.type.js';

@ApiTags('orders')
@ApiAuthResponses()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly getOrder: GetOrderUseCase,
    private readonly updateStatus: UpdateOrderStatusUseCase,
    private readonly listOrders: ListOrdersUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Allows authenticated customers to place a new order with selected menu items.',
  })
  @ApiCreatedResponse({
    description: 'Order successfully created',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-uuid',
        status: 'WAITING',
        totalAmount: 45.9,
        createdAt: '2025-12-27T10:00:00Z',
        items: [
          { menuItemId: 'cappuccino', quantity: 2, price: 12.9 },
          { menuItemId: 'croissant', quantity: 1, price: 14.9 },
        ],
      },
    },
  })
  @CustomerOrManager()
  async create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    return this.createOrder.execute(
      CreateOrderMapper.toCommand(dto, user.userId),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Returns a specific order. Customers can only view their own orders. Managers can view any order.',
  })
  @ApiOkResponse({
    description: 'Order found and returned',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-uuid',
        status: 'PREPARING',
        totalAmount: 45.9,
        createdAt: '2025-12-27T10:00:00Z',
        updatedAt: '2025-12-27T10:15:00Z',
        items: [
          { name: 'Cappuccino', quantity: 2, price: 12.9 },
          { name: 'Croissant', quantity: 1, price: 14.9 },
        ],
      },
    },
  })
  @CustomerOrManager()
  @UseGuards(OrderOwnershipGuard)
  async findOne(@Param('id') id: string) {
    return this.getOrder.execute(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Allows managers to change the status of an order (e.g., from WAITING to PREPARATION, READY, etc.).',
  })
  @ApiOkResponse({
    description: 'Order status updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'READY',
        updatedAt: '2025-12-27T10:30:00Z',
      },
    },
  })
  @ManagerOnly()
  async updateStatusByManager(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.updateStatus.execute(id, dto.status);
  }

  @Get()
  @ApiOperation({
    summary: 'List orders (paginated)',
    description:
      'Returns a paginated list of orders. Managers see all orders. Customers see only their own.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (max 100)',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Paginated list of orders',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'READY',
            totalAmount: 45.9,
            createdAt: '2025-12-27T10:00:00Z',
            items: [
              { name: 'Cappuccino', quantity: 2 },
              { name: 'Croissant', quantity: 1 },
            ],
          },
        ],
        meta: {
          total: 42,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      },
    },
  })
  @ManagerOnly()
  async list(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.listOrders.execute(
      OrderQueryMapper.toListQuery(pagination, user),
    );
  }
}

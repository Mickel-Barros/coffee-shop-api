import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator.js';
import { Role } from '../../../domain/enums/role.enum.js';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.usecase.js';
import { GetOrderUseCase } from '../../../application/use-cases/get-order.usecase.js';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/update-order-status.usecase.js';
import { ListOrdersUseCase } from '../../../application/use-cases/list-orders.usecase.js';
import { CreateOrderDto } from '../dtos/create-order.dto.js';
import { UpdateStatusDto } from '../dtos/update-status.dto.js';
import { PaginationDto } from '../dtos/pagination.dto.js';
import { CreateOrderMapper } from '../../../application/mappers/create-order.mapper.js';
import { JwtAuthGuard } from '../../auth/jwt.auth-guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    role: Role;
  };
}

@ApiTags('orders')
@ApiBearerAuth('jwt')
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
  @Roles(Role.CUSTOMER, Role.MANAGER)
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
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - missing or invalid token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - only customers can place orders',
  })
  @ApiBadRequestResponse({ description: 'Invalid order data' })
  async create(@Body() dto: CreateOrderDto, @Request() req: RequestWithUser) {
    const command = CreateOrderMapper.toCommand(dto, req.user.userId);
    return this.createOrder.execute(command);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.MANAGER)
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - you can only view your own orders',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const order = await this.getOrder.execute(id);

    if (req.user.role !== Role.MANAGER && order.userId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  @Patch(':id/status')
  @Roles(Role.MANAGER)
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - only managers can update status',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid status value' })
  async update(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.updateStatus.execute(id, dto.status);
  }

  @Get()
  @Roles(Role.MANAGER)
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async list(
    @Query() pagination: PaginationDto,
    @Request() req: RequestWithUser,
  ) {
    const isManager = req.user.role === 'manager';
    const page = Number(pagination.page) || 1;
    const limit = Math.min(Number(pagination.limit) || 10, 100);

    return this.listOrders.execute({
      page,
      limit,
      userId: isManager ? undefined : req.user.userId,
    });
  }
}

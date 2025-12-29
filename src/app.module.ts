import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import JoiImport from 'joi';
// Infrastructure
import { PrismaService } from './infrastructure/prisma/prisma.service.js';
import { JwtAuthGuard } from './infrastructure/auth/jwt.auth-guard.js';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy.js';
import { RolesGuard } from './infrastructure/auth/roles.guard.js';
import { JwtModule } from '@nestjs/jwt';

// Controllers
import { MenuController } from './infrastructure/http/controllers/menu.controller.js';
import { OrdersController } from './infrastructure/http/controllers/orders.controller.js';
import { AuthController } from './infrastructure/http/controllers/auth.controller.js';

// Use Cases
import { CreateOrderUseCase } from './application/use-cases/create-order.usecase.js';
import { GetOrderUseCase } from './application/use-cases/get-order.usecase.js';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.usecase.js';
import { ListOrdersUseCase } from './application/use-cases/list-orders.usecase.js';
import { LoginUseCase } from './application/use-cases/login.usecase.js';
import { SignupUseCase } from './application/use-cases/signup.usecase.js';

// Services
import { PaymentService } from './application/services/payment.service.js';
import { NotificationService } from './application/services/notification.service.js';

// Repositories
import { PrismaOrderRepository } from './infrastructure/prisma/prisma-order.repository.js';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-user.repository.js';

// Middleware and Logger
import { RequestLoggingMiddleware } from './shared/middlewares/request-logging.middleware.js';
import { AppLogger } from './shared/logger/app.logger.js';

const Joi = JoiImport;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,

      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),

        PORT: Joi.number().default(3000),

        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(32).required(),

        CORS_ORIGINS: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: process.env.NODE_ENV === 'production' ? 100 : 1000,
      },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [MenuController, OrdersController, AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Prisma
    PrismaService,

    // Repositories

    PrismaOrderRepository,
    PrismaUserRepository,

    // Use Cases
    CreateOrderUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    ListOrdersUseCase,
    LoginUseCase,
    SignupUseCase,

    // External Services
    PaymentService,
    NotificationService,
    JwtStrategy,

    // Logger
    AppLogger,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*'); // Log em todas as rotas
  }
}

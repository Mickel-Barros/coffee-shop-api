import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { LoginUseCase } from '../../../application/use-cases/login.usecase.js';
import { SignupUseCase } from '../../../application/use-cases/signup.usecase.js';
import { LoginDto } from '../dtos/login.dto.js';
import { SignupDto } from '../dtos/signup.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
  ) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT access token.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImN1c3RvbWVyQGNvZmZlZS5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3MzUzMDAwMDAsImV4cCI6MTczNTMwMzYwMH0.exampleSignature',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'customer@coffee.com',
          role: 'customer',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({
    description: 'Invalid input (e.g., malformed email)',
  })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User signup',
    description: 'Registers a new user.',
  })
  @ApiBody({
    type: SignupDto,
    description: 'Signup payload',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'customer@coffee.com',
        name: 'John Coffee',
        role: 'CUSTOMER',
        createdAt: '2025-12-27T12:45:00.000Z',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email already in use',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  async signup(@Body() dto: SignupDto) {
    return this.signupUseCase.execute(dto);
  }
}

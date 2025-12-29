import { GlobalExceptionFilter } from '../../shared/filters/global-exception.filter';
import { AppLogger } from '../../shared/logger/app.logger';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let logger: AppLogger;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let host: ArgumentsHost;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
    } as any;

    filter = new GlobalExceptionFilter(logger);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      method: 'GET',
      url: '/api/orders/123',
    };

    const mockCtx = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    host = mockCtx as ArgumentsHost;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  it('should handle HttpException with custom message and status', () => {
    const exception = new HttpException(
      'Order not found',
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Order not found',
        path: '/api/orders/123',
        timestamp: expect.any(String),
      }),
    );

    expect(logger.error).toHaveBeenCalledWith(
      'GET /api/orders/123 - 404',
      expect.stringContaining('HttpException: Order not found'),
      'ExceptionFilter',
    );
  });

  it('should handle HttpException with object response (validation errors)', () => {
    const exception = new HttpException(
      {
        message: ['Invalid email format', 'Password too weak'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Invalid email format', 'Password too weak'],
        path: '/api/orders/123',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle unknown error (non-HttpException) with generic message', () => {
    const exception = new Error('Database connection failed');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/api/orders/123',
        timestamp: expect.any(String),
      }),
    );

    expect(logger.error).toHaveBeenCalledWith(
      'GET /api/orders/123 - 500',
      exception.stack,
      'ExceptionFilter',
    );
  });

  it('should include stack trace in development for unknown errors', () => {
    process.env.NODE_ENV = 'development';

    const exception = new Error('Something went wrong');

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/api/orders/123',
        timestamp: expect.any(String),
        stack: exception.stack,
      }),
    );
  });

  it('should NOT include stack trace in production even for unknown errors', () => {
    process.env.NODE_ENV = 'production';

    const exception = new Error('Critical failure');

    filter.catch(exception, host);

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

    expect(jsonCall).toEqual({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: '/api/orders/123',
      timestamp: expect.any(String),
    });

    expect(jsonCall).not.toHaveProperty('stack');
  });

  it('should always log full error details regardless of environment', () => {
    process.env.NODE_ENV = 'production';

    const exception = new Error('Secret leak');

    filter.catch(exception, host);

    expect(logger.error).toHaveBeenCalledWith(
      'GET /api/orders/123 - 500',
      exception.stack,
      'ExceptionFilter',
    );
  });

  it('should handle non-Error exceptions (primitive values)', () => {
    const exception = 'Unexpected string error';

    filter.catch(exception as any, host);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: '/api/orders/123',
      timestamp: expect.any(String),
    });

    expect(logger.error).toHaveBeenCalledWith(
      'GET /api/orders/123 - 500',
      'Unexpected string error',
      'ExceptionFilter',
    );
  });
});

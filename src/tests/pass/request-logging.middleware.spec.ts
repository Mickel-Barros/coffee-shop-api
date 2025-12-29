import { AppLogger } from '../../shared/logger/app.logger';
import { RequestLoggingMiddleware } from '../../shared/middlewares/request-logging.middleware';
import { Request, Response, NextFunction } from 'express';

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;
  let mockLogger: Partial<AppLogger>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
    };

    middleware = new RequestLoggingMiddleware(mockLogger as AppLogger);

    mockReq = {
      method: 'POST',
      originalUrl: '/api/orders',
    };

    mockRes = {
      statusCode: 201,
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          (mockRes as any)._finishCallback = callback;
        }
        return mockRes;
      }),
    } as Partial<Response>;

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() immediately', () => {
    middleware.use(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should log request details when response finishes', () => {
    jest
      .spyOn(Date, 'now')
      .mockImplementationOnce(() => 1000)
      .mockImplementationOnce(() => 1150);

    middleware.use(mockReq as Request, mockRes as Response, mockNext);

    (mockRes as any)._finishCallback();

    expect(mockLogger.log).toHaveBeenCalledWith(
      'POST /api/orders 201 - 150ms',
      'HTTP',
    );
    expect(mockLogger.log).toHaveBeenCalledTimes(1);
  });

  it('should handle different HTTP methods and status codes', () => {
    const testCases = [
      {
        method: 'GET',
        url: '/api/products',
        status: 200,
        expected: 'GET /api/products 200 - ',
      },
      {
        method: 'PUT',
        url: '/api/orders/123',
        status: 200,
        expected: 'PUT /api/orders/123 200 - ',
      },
      {
        method: 'DELETE',
        url: '/api/orders/456',
        status: 204,
        expected: 'DELETE /api/orders/456 204 - ',
      },
      {
        method: 'POST',
        url: '/api/auth/login',
        status: 400,
        expected: 'POST /api/auth/login 400 - ',
      },
      {
        method: 'GET',
        url: '/health',
        status: 500,
        expected: 'GET /health 500 - ',
      },
    ];

    testCases.forEach(({ method, url, status, expected }) => {
      jest
        .spyOn(Date, 'now')
        .mockImplementationOnce(() => 2000)
        .mockImplementationOnce(() => 2200);

      const req = { method, originalUrl: url } as Partial<Request>;
      const res = {
        statusCode: status,
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'finish') (res as any)._finishCallback = callback;
        }),
      } as Partial<Response>;

      middleware.use(req as Request, res as Response, mockNext);

      (res as any)._finishCallback();

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining(expected),
        'HTTP',
      );

      (mockLogger.log as jest.Mock).mockClear();
    });
  });

  it('should use originalUrl when available', () => {
    jest
      .spyOn(Date, 'now')
      .mockImplementationOnce(() => 3000)
      .mockImplementationOnce(() => 3100);

    const reqWithOriginalUrl = {
      method: 'GET',
      originalUrl: '/api/products', // tem originalUrl
      url: '/fallback-should-not-be-used',
    } as Partial<Request>;

    const res = {
      statusCode: 200,
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') (res as any)._finishCallback = callback;
      }),
    } as Partial<Response>;

    middleware.use(reqWithOriginalUrl as Request, res as Response, mockNext);

    (res as any)._finishCallback();

    expect(mockLogger.log).toHaveBeenCalledWith(
      'GET /api/products 200 - 100ms',
      'HTTP',
    );
  });

  it('should log undefined path if originalUrl is not present', () => {
    jest
      .spyOn(Date, 'now')
      .mockImplementationOnce(() => 4000)
      .mockImplementationOnce(() => 4120);

    const reqWithoutOriginalUrl = {
      method: 'PATCH',
      url: '/should-not-be-used',
      // originalUrl intencionalmente ausente
    } as Partial<Request>;

    const res = {
      statusCode: 200,
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') (res as any)._finishCallback = callback;
      }),
    } as Partial<Response>;

    middleware.use(reqWithoutOriginalUrl as Request, res as Response, mockNext);

    (res as any)._finishCallback();

    expect(mockLogger.log).toHaveBeenCalledWith(
      'PATCH undefined 200 - 120ms',
      'HTTP',
    );
  });

  it('should calculate duration correctly even with long requests', () => {
    jest
      .spyOn(Date, 'now')
      .mockImplementationOnce(() => 1000000)
      .mockImplementationOnce(() => 1001500); // 1500ms

    middleware.use(mockReq as Request, mockRes as Response, mockNext);

    (mockRes as any)._finishCallback();

    expect(mockLogger.log).toHaveBeenCalledWith(
      'POST /api/orders 201 - 1500ms',
      'HTTP',
    );
  });
});

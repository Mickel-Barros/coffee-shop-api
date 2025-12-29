import { AppLogger } from '../../shared/logger/app.logger';

describe('AppLogger', () => {
  let logger: AppLogger;

  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const consoleWarnSpy = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => {});
  const consoleDebugSpy = jest
    .spyOn(console, 'debug')
    .mockImplementation(() => {});

  beforeEach(() => {
    logger = new AppLogger();
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleDebugSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('log', () => {
    it('should log message without context', () => {
      logger.log('Application started');

      expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] Application started');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should log message with context', () => {
      logger.log('User created', 'UsersService');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[LOG] [UsersService] User created',
      );
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('error', () => {
    it('should log error message without trace or context', () => {
      logger.error('Failed to connect to database');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] Failed to connect to database',
        undefined,
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log error with trace and context', () => {
      const stack = 'Error: Connection timeout\n    at ...';
      logger.error('Database timeout', stack, 'OrderRepository');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] [OrderRepository] Database timeout',
        stack,
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log error when trace is undefined but context exists', () => {
      logger.error('Validation failed', undefined, 'AuthService');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] [AuthService] Validation failed',
        undefined,
      );
    });
  });

  describe('warn', () => {
    it('should log warning without context', () => {
      logger.warn('Deprecation notice: old endpoint will be removed');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN] Deprecation notice: old endpoint will be removed',
      );
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should log warning with context', () => {
      logger.warn('High memory usage detected', 'PerformanceMonitor');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN] [PerformanceMonitor] High memory usage detected',
      );
    });
  });

  describe('debug', () => {
    it('should log debug message in development environment', () => {
      process.env.NODE_ENV = 'development';

      logger.debug(
        'Processing request with params: { id: 123 }',
        'OrderController',
      );

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG] [OrderController] Processing request with params: { id: 123 }',
      );
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT log debug message in production environment', () => {
      process.env.NODE_ENV = 'production';

      logger.debug('Sensitive debug info', 'PaymentService');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should log debug without context in development', () => {
      process.env.NODE_ENV = 'development';

      logger.debug('Cache miss');

      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Cache miss');
    });
  });
});

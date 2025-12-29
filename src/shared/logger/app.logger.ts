import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements NestLoggerService {
  log(message: string, context?: string) {
    console.log(`[LOG]${context ? ` [${context}]` : ''} ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[ERROR]${context ? ` [${context}]` : ''} ${message}`, trace);
  }

  warn(message: string, context?: string) {
    console.warn(`[WARN]${context ? ` [${context}]` : ''} ${message}`);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG]${context ? ` [${context}]` : ''} ${message}`);
    }
  }
}

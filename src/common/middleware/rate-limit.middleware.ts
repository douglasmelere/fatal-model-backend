import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requestCounts: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const windowMs = parseInt(
      this.configService.get('RATE_LIMIT_WINDOW_MS') || '900000',
      10,
    );
    const maxRequests = parseInt(
      this.configService.get('RATE_LIMIT_MAX_REQUESTS') || '100',
      10,
    );

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!this.requestCounts.has(ip)) {
      this.requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = this.requestCounts.get(ip);

    if (!record) {
      next();
      return;
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      return res.status(429).json({
        statusCode: 429,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(record.resetTime / 1000),
    );

    next();
  }
}

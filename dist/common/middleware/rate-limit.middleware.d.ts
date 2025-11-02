import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class RateLimitMiddleware implements NestMiddleware {
    private configService;
    private requestCounts;
    constructor(configService: ConfigService);
    use(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
}

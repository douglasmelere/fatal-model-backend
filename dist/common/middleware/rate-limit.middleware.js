"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RateLimitMiddleware = class RateLimitMiddleware {
    configService;
    requestCounts = new Map();
    constructor(configService) {
        this.configService = configService;
    }
    use(req, res, next) {
        const windowMs = parseInt(this.configService.get('RATE_LIMIT_WINDOW_MS') || '900000', 10);
        const maxRequests = parseInt(this.configService.get('RATE_LIMIT_MAX_REQUESTS') || '100', 10);
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
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
        next();
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map
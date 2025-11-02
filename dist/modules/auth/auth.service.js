"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const entities_1 = require("../../database/entities");
const profiles_service_1 = require("../profiles/profiles.service");
let AuthService = class AuthService {
    usersRepository;
    jwtService;
    profilesService;
    constructor(usersRepository, jwtService, profilesService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.profilesService = profilesService;
    }
    async register(registerDto) {
        const { email, password, role, first_name, last_name } = registerDto;
        const existingUser = await this.usersRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            role,
            first_name,
            last_name,
            status: entities_1.UserStatus.ACTIVE,
        });
        const savedUser = await this.usersRepository.save(user);
        if (role === entities_1.UserRole.ESCORT) {
            const display_name = first_name || email;
            await this.profilesService.createProfile(savedUser.id, { display_name });
        }
        const { accessToken, refreshToken } = await this.generateTokens(savedUser.id, savedUser.email, savedUser.role);
        return {
            user: this.sanitizeUser(savedUser),
            accessToken,
            refreshToken,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== entities_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('User account is not active');
        }
        user.last_login = new Date();
        await this.usersRepository.save(user);
        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
        return {
            user: this.sanitizeUser(user),
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const user = await this.usersRepository.findOne({
                where: { id: payload.sub },
            });
            if (!user || user.status !== entities_1.UserStatus.ACTIVE) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id, user.email, user.role);
            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: Number(process.env.JWT_EXPIRATION) || 3600,
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: Number(process.env.JWT_REFRESH_EXPIRATION) || 604800,
        });
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        jwt_1.JwtService,
        profiles_service_1.ProfilesService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
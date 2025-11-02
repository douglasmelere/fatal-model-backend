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
exports.DebugController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profile_entity_1 = require("./database/entities/profile.entity");
const user_entity_1 = require("./database/entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
let DebugController = class DebugController {
    profilesRepository;
    usersRepository;
    constructor(profilesRepository, usersRepository) {
        this.profilesRepository = profilesRepository;
        this.usersRepository = usersRepository;
    }
    async debugProfiles() {
        const profiles = await this.profilesRepository.find({ relations: ['user'] });
        return profiles.map(p => ({
            id: p.id,
            display_name: p.display_name,
            is_active: p.is_active,
            user_id: p.user_id,
            user_role: p.user?.role,
            user_email: p.user?.email,
        }));
    }
    async debugAdmins() {
        const admins = await this.usersRepository.find({
            where: { role: user_entity_1.UserRole.ADMIN },
        });
        return {
            count: admins.length,
            admins: admins.map(u => ({
                id: u.id,
                email: u.email,
                first_name: u.first_name,
                last_name: u.last_name,
                status: u.status,
                created_at: u.created_at,
            })),
        };
    }
    async createAdmin(body) {
        const existingAdmins = await this.usersRepository.count({
            where: { role: user_entity_1.UserRole.ADMIN },
        });
        if (existingAdmins > 0) {
            return {
                success: false,
                message: 'Admin user already exists. Use the register endpoint or contact an existing admin.',
            };
        }
        const existingUser = await this.usersRepository.findOne({
            where: { email: body.email },
        });
        if (existingUser) {
            return {
                success: false,
                message: 'Email already registered',
            };
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const admin = this.usersRepository.create({
            email: body.email,
            password: hashedPassword,
            role: user_entity_1.UserRole.ADMIN,
            first_name: body.first_name,
            last_name: body.last_name,
            status: user_entity_1.UserStatus.ACTIVE,
            verification_status: user_entity_1.VerificationStatus.VERIFIED,
        });
        const savedAdmin = await this.usersRepository.save(admin);
        return {
            success: true,
            message: 'Admin user created successfully',
            user: {
                id: savedAdmin.id,
                email: savedAdmin.email,
                first_name: savedAdmin.first_name,
                last_name: savedAdmin.last_name,
                role: savedAdmin.role,
                status: savedAdmin.status,
            },
        };
    }
};
exports.DebugController = DebugController;
__decorate([
    (0, common_1.Get)('profiles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DebugController.prototype, "debugProfiles", null);
__decorate([
    (0, common_1.Get)('admins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DebugController.prototype, "debugAdmins", null);
__decorate([
    (0, common_1.Post)('create-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DebugController.prototype, "createAdmin", null);
exports.DebugController = DebugController = __decorate([
    (0, common_1.Controller)('debug'),
    __param(0, (0, typeorm_1.InjectRepository)(profile_entity_1.ProfileEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DebugController);
//# sourceMappingURL=debug.controller.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
const entities_1 = require("../../database/entities");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async getRecommendations(user, recommendationRequest) {
        return this.aiService.getRecommendations(user.id, recommendationRequest);
    }
    async getRecommendationHistory(user, limit = 10, offset = 0) {
        return this.aiService.getRecommendationHistory(user.id, limit, offset);
    }
    async provideFeedback(user, body) {
        return this.aiService.getFeedback(user.id, body.recommendationId, body.rating, body.feedback);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('recommend'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered recommendations (Me Surpreenda)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recommendations generated successfully',
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity,
        dto_1.RecommendationRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('recommendations/history'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get recommendation history' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recommendation history retrieved successfully',
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity, Number, Number]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getRecommendationHistory", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Provide feedback on recommendations' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Feedback recorded successfully',
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "provideFeedback", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI Recommendations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map
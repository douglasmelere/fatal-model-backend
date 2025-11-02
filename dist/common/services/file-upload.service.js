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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const AWS = __importStar(require("aws-sdk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FileUploadService = class FileUploadService {
    configService;
    s3;
    useLocalStorage;
    localStoragePath;
    constructor(configService) {
        this.configService = configService;
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        this.useLocalStorage = !accessKeyId || !secretAccessKey;
        this.localStoragePath = path.join(process.cwd(), 'uploads');
        if (!this.useLocalStorage) {
            this.s3 = new AWS.S3({
                accessKeyId,
                secretAccessKey,
                region: this.configService.get('AWS_REGION') || 'us-east-1',
            });
        }
        else {
            if (!fs.existsSync(this.localStoragePath)) {
                fs.mkdirSync(this.localStoragePath, { recursive: true });
            }
        }
    }
    async uploadFile(file, folder = 'uploads') {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        this.validateFile(file);
        if (this.useLocalStorage) {
            return this.uploadToLocalStorage(file, folder);
        }
        else {
            return this.uploadToS3(file, folder);
        }
    }
    async uploadMultipleFiles(files, folder = 'uploads') {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadPromises = files.map((file) => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }
    async uploadToS3(file, folder) {
        const key = `${folder}/${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: this.configService.get('AWS_S3_BUCKET') || '',
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };
        try {
            await this.s3.upload(params).promise();
            const region = this.configService.get('AWS_REGION') || 'us-east-1';
            const bucket = this.configService.get('AWS_S3_BUCKET');
            return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    uploadToLocalStorage(file, folder) {
        const folderPath = path.join(this.localStoragePath, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(folderPath, filename);
        fs.writeFileSync(filepath, file.buffer);
        return `/uploads/${folder}/${filename}`;
    }
    validateFile(file) {
        const maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE') || '5242880', 10);
        const allowedTypes = (this.configService.get('ALLOWED_FILE_TYPES') || 'jpg,jpeg,png,gif,pdf').split(',');
        if (file.size > maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxFileSize} bytes`);
        }
        const fileExtension = file?.originalname?.split('.')?.pop()?.toLowerCase() ?? '';
        if (!allowedTypes.includes(fileExtension)) {
            throw new common_1.BadRequestException(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
    }
    async deleteFile(fileUrl) {
        if (this.useLocalStorage) {
            this.deleteLocalFile(fileUrl);
        }
        else {
            this.deleteS3File(fileUrl);
        }
    }
    deleteLocalFile(fileUrl) {
        try {
            const filepath = path.join(process.cwd(), fileUrl);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete file: ${error.message}`);
        }
    }
    async deleteS3File(fileUrl) {
        try {
            const key = fileUrl.split('.com/')[1];
            const params = {
                Bucket: this.configService.get('AWS_S3_BUCKET') || '',
                Key: key,
            };
            await this.s3.deleteObject(params).promise();
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete file: ${error.message}`);
        }
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map
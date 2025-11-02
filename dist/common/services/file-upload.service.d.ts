import { ConfigService } from '@nestjs/config';
export declare class FileUploadService {
    private configService;
    private s3;
    private useLocalStorage;
    private localStoragePath;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
    uploadMultipleFiles(files: Express.Multer.File[], folder?: string): Promise<string[]>;
    private uploadToS3;
    private uploadToLocalStorage;
    private validateFile;
    deleteFile(fileUrl: string): Promise<void>;
    private deleteLocalFile;
    private deleteS3File;
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private s3: AWS.S3;
  private useLocalStorage: boolean;
  private localStoragePath: string;

  constructor(private configService: ConfigService) {
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
    } else {
      // Create local storage directory if it doesn't exist
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.validateFile(file);

    if (this.useLocalStorage) {
      return this.uploadToLocalStorage(file, folder);
    } else {
      return this.uploadToS3(file, folder);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) =>
      this.uploadFile(file, folder),
    );

    return Promise.all(uploadPromises);
  }

  private async uploadToS3(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    const params: AWS.S3.PutObjectRequest = {
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
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  private uploadToLocalStorage(
    file: Express.Multer.File,
    folder: string,
  ): string {
    const folderPath = path.join(this.localStoragePath, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(folderPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    return `/uploads/${folder}/${filename}`;
  }

  private validateFile(file: Express.Multer.File): void {
    const maxFileSize = parseInt(
      this.configService.get('MAX_FILE_SIZE') || '5242880',
      10,
    );
    const allowedTypes = (
      this.configService.get('ALLOWED_FILE_TYPES') || 'jpg,jpeg,png,gif,pdf'
    ).split(',');

    if (file.size > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxFileSize} bytes`,
      );
    }

    const fileExtension = file?.originalname?.split('.')?.pop()?.toLowerCase() ?? '';
    if (!allowedTypes.includes(fileExtension)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (this.useLocalStorage) {
      this.deleteLocalFile(fileUrl);
    } else {
      this.deleteS3File(fileUrl);
    }
  }

  private deleteLocalFile(fileUrl: string): void {
    try {
      const filepath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  private async deleteS3File(fileUrl: string): Promise<void> {
    try {
      const key = fileUrl.split('.com/')[1];
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: this.configService.get('AWS_S3_BUCKET') || '',
        Key: key,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }
}

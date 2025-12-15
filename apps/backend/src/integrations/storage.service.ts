import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async uploadFile(file: Buffer, fileName: string, folder: string): Promise<string> {
    this.logger.log(`☁️ Uploading file ${fileName} to ${folder}`);

    // TODO: Integrate with AWS S3 or Supabase Storage
    // const AWS = require('aws-sdk');
    // const s3 = new AWS.S3({
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //   region: process.env.AWS_REGION,
    // });
    //
    // const params = {
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: `${folder}/${fileName}`,
    //   Body: file,
    //   ContentType: 'application/pdf',
    // };
    //
    // const result = await s3.upload(params).promise();
    // return result.Location;

    // Mock URL for now
    return `https://storage.smartprocure.com/${folder}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    this.logger.log(`🗑️ Deleting file ${fileUrl}`);

    // TODO: Implement with AWS S3
  }
}

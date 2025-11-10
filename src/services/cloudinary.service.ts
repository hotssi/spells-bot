import axios from 'axios';
import { logger } from '../utils/logger';
import { assertEnvVariable } from '../utils/error-handler';
import type { CloudinaryUploadResult, ImageProcessOptions } from '../types/services';

class CloudinaryService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = assertEnvVariable('CLOUDINARY_CLOUD_NAME');
    this.apiKey = assertEnvVariable('CLOUDINARY_API_KEY');
    this.apiSecret = assertEnvVariable('CLOUDINARY_API_SECRET');
  }

  async uploadImage(imageUrl: string): Promise<CloudinaryUploadResult> {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    logger.debug('Uploading image to Cloudinary', { imageUrl });

    try {
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('api_key', this.apiKey);
      formData.append('timestamp', String(Math.floor(Date.now() / 1000)));

      const response = await axios.post<CloudinaryUploadResult>(uploadUrl, formData, {
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      });

      logger.info('Image uploaded successfully', { publicId: response.data.public_id });
      return response.data;
    } catch (error) {
      logger.error('Failed to upload image', error);
      throw new Error('Image upload failed');
    }
  }

  generateProcessedUrl(publicId: string, options: ImageProcessOptions): string {
    const transformations: string[] = [];

    if (options.blur) {
      transformations.push(`e_blur:${options.blur}`);
    }

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    const format = options.format || 'jpg';
    const transformation = transformations.join(',');

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicId}.${format}`;
  }

  async processImage(
    imageUrl: string,
    options: ImageProcessOptions
  ): Promise<{ original: string; processed: string }> {
    const uploaded = await this.uploadImage(imageUrl);
    const processed = this.generateProcessedUrl(uploaded.public_id, options);

    return {
      original: uploaded.secure_url,
      processed,
    };
  }
}

export const cloudinaryService = new CloudinaryService();

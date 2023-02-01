import { CallHandler, ExecutionContext, Injectable, Logger, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Observable } from 'rxjs';

import { GCloudStoragePerRequestOptions } from './gcloud-storage.interface';
import { GCloudStorageService } from './gcloud-storage.service';
import sharp from 'sharp';

export function GCloudStorageFilesInterceptor(
  fieldName: string,
  localOptions?: MulterOptions,
  gcloudStorageOptions?: Partial<GCloudStoragePerRequestOptions>,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    public interceptor: NestInterceptor;

    constructor(private readonly gcloudStorage: GCloudStorageService) {
      this.interceptor = new (FilesInterceptor(fieldName, 20, localOptions))();
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      (await this.interceptor.intercept(context, next)) as Observable<any>;

      const request = context.switchToHttp().getRequest();

      const files = request[fieldName];

      if (!files.length) {
        Logger.error(
          'GCloudStorageFilesInterceptor',
          `Can not intercept field "${fieldName}". Did you specify the correct field name in @GCloudStorageFilesInterceptor('${fieldName}')?`,
        );
        return;
      }

      const uploadFile = async (file, width, height) => {
        const image = sharp(file.buffer);
        const outputBuffer = await image.rotate().resize(width, height).jpeg().toBuffer({ resolveWithObject: true });
        const storedObject = {
          fieldname: fieldName,
          originalname: file.originalName,
          encoding: file.encoding,
          mimetype: 'image/jpeg',
          buffer: outputBuffer.data,
          size: outputBuffer.info.size,
          storageUrl: null,
        };
        const storageUrl = await this.gcloudStorage.upload(storedObject, gcloudStorageOptions);
        storedObject.storageUrl = storageUrl;
        return storedObject;
      };
      for (const key in files) {
        files[key] = await uploadFile(files[key], 600, 848);
      }

      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}

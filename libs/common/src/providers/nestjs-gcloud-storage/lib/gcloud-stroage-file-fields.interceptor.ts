import { CallHandler, ExecutionContext, Injectable, Logger, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Observable } from 'rxjs';

import { GCloudStoragePerRequestOptions } from './gcloud-storage.interface';
import { GCloudStorageService } from './gcloud-storage.service';
import sharp from 'sharp';

export function GCloudStorageFileFieldsInterceptor(
  uploadFields,
  localOptions?: MulterOptions,
  gcloudStorageOptions?: Partial<GCloudStoragePerRequestOptions>,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    public interceptor: NestInterceptor;

    constructor(private readonly gcloudStorage: GCloudStorageService) {
      this.interceptor = new (FileFieldsInterceptor(uploadFields))();
      // this.interceptor = new (FileInterceptor(fieldName, localOptions))();
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      (await this.interceptor.intercept(context, next)) as Observable<any>;

      const uploadFile = async (fieldName, file, width, height) => {
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

      const request = context.switchToHttp().getRequest();
      console.log(request['files']);
      await Promise.all(
        uploadFields.map(async (e) => {
          for (let i = 0; i < e.maxCount; i++) {
            if (!request['files'][e.name][i]) break;
            const file = request['files'][e.name][i];
            if (!file) {
              Logger.error(
                'GCloudStorageFileInterceptor',
                `Can not intercept field "${e.name}". Did you specify the correct field name in @GCloudStorageFileInterceptor('${e.name}')?`,
              );
              return;
            }
            request['files'][e.name][i] = await uploadFile(e.name, file, 600, 848);
          }
        }),
      );

      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}

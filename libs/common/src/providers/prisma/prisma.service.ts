import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  ApprovedSubnet,
  Email,
  PrismaClient,
  Session,
  User,
} from '@prisma/client';
import { Expose } from './prisma.interface';
import { applyMiddleware } from './middleware';
import { DefaultService } from '@matching/common/modules/default/default.service';
// import { DefaultService } from 'src/modules/default/default.service';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private defaultService: DefaultService) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    applyMiddleware(this, this.defaultService);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Delete sensitive keys from an object */
  expose<T>(item: T): Expose<T> {
    if (!item) return {} as T;
    if ((item as any as Partial<User>).password)
      (item as any).hasPassword = true;
    delete (item as any as Partial<User>).password;
    delete (item as any as Partial<User>).twoFactorSecret;
    delete (item as any as Partial<Session>).token;
    delete (item as any as Partial<Email>).emailSafe;
    delete (item as any as Partial<ApprovedSubnet>).subnet;
    return item;
  }
}

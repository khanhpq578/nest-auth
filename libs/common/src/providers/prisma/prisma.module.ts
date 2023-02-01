import { Module } from '@nestjs/common';
import { DefaultModule } from '@matching/common/modules/default/default.module';
import { PrismaService } from './prisma.service';
// import { DefaultModule } from 'src/modules/default/default.module';
@Module({
  imports: [DefaultModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

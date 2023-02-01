import { Module } from '@nestjs/common';
import { DefaultService } from './default.service';
import { DefaultController } from './default.controller';
import { ConfigService } from '@nestjs/config';
import { KafkaModule } from '@chttrbx/kafka';
import { UsersModule } from '../../../../../apps/api/src/modules/users/users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // KafkaModule.registerAsync({
    //   useFactory: async (configService: ConfigService) => ({
    //     client: {
    //       clientId: 'my-service',
    //       brokers: [configService.get<string>('KAFKA_ADDRESS')],
    //     },
    //     consumer: {
    //       groupId: 'my-service',
    //       allowAutoTopicCreation: true,
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_API_CLIENT',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'api',
              brokers: [configService.get<string>('KAFKA_ADDRESS')],
            },
            consumer: {
              groupId: 'api-consumer',
            },
          },
        }),
      },
    ]),
  ],
  providers: [DefaultService],
  controllers: [DefaultController],
  exports: [DefaultService],
})
export class DefaultModule {}

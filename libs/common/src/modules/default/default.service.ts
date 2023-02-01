import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
// import { KafkaService } from 'src/common/kafka/kafka.service';
// import { KafkaPayload } from 'src/common/kafka/kafka.message';
// import { HELLO_FIXED_TOPIC, USER_TOPIC } from 'src/constant';
// import { KafkaService, SubscribeTo } from '@chttrbx/kafka';

@Injectable()
export class DefaultService {
  constructor(
    @Inject('KAFKA_API_CLIENT') private readonly kafkaApiClient: ClientKafka, // private readonly kafkaService: KafkaService
  ) {}

  getHello() {
    return {
      value: 'hello world',
    };
  }
  async randomUser() {
    this.kafkaApiClient.emit('RANDOM_USER', {});
    return 'ok';
  }
  async notifyAdmin(prismaParams) {
    console.log('executed 1111');
    this.kafkaApiClient.emit('ADMIN_COUNT_UPDATE', { prismaParams });
  }

  async updateUser(userId: number, type?: string) {
    const message = {
      value: userId,
    };
    this.kafkaApiClient.emit('USER_CREATED', { userId });
    return message;
  }
  async updateAllUser() {
    const message = {
      value: 'all',
    };
    this.kafkaApiClient.emit('USER_ALL', {});
    return message;
  }
  async putMappingUser() {
    this.kafkaApiClient.emit('USER_MAPPING', {});
    return 1;
  }
  async subscriberChange(subscriberId: number) {
    this.kafkaApiClient.emit('USER_SUBSCRIBER_CHANGE', { subscriberId });
  }
  async pushNotification(userId: number, subscriberId: number, type: string) {
    this.kafkaApiClient.emit('USER_SUBSRIBER', { userId });
  }
  async createLikeSchedulerIfNotExists(
    original_transaction_id: string,
  ): Promise<void> {
    this.kafkaApiClient.emit('USER_CREATE_LIKE_SCHEDULER_FROM_SUBSCRIBER', {
      original_transaction_id,
    });
  }
  async pushNotificationApproval(userId: number) {
    this.kafkaApiClient.emit('USER_APPROVAL', { userId });
  }
  async addLikeWhenUserProfileCreate(userId: number) {
    this.kafkaApiClient.emit('USER_ADD_LIKE', { userId });
  }
  async checkApprovalManagement(id: number) {
    this.kafkaApiClient.emit('USER_PROFILE_APPROVAL', { id });
  }
  async createLikeScheduler(userId: number): Promise<void> {
    this.kafkaApiClient.emit('CREATE_LIKE_SCHEDULER', { userId });
  }

  //   async send() {
  //     const message = {
  //       value: 'Message send to Kakfa Topic',
  //     };
  //     const payload: KafkaPayload = {
  //       messageId: '' + new Date().valueOf(),
  //       body: message,
  //       messageType: 'Say.Hello',
  //       topicName: 'hello.topic',
  //     };
  //     const value = await this.kafkaService.sendMessage('hello.topic', payload);
  //     console.log('kafka status ', value);
  //     return message;
  //   }

  //   async sendToFixedConsumer() {
  //     const message = {
  //       value: 'Message send to Kakfa Topic',
  //     };
  //     const payload: KafkaPayload = {
  //       messageId: '' + new Date().valueOf(),
  //       body: message,
  //       messageType: 'Say.Hello',
  //       topicName: HELLO_FIXED_TOPIC, // topic name could be any name
  //     };
  //     const value = await this.kafkaService.sendMessage(
  //       HELLO_FIXED_TOPIC,
  //       payload,
  //     );
  //     console.log('kafka status ', value);
  //     return message;
  //   }
}

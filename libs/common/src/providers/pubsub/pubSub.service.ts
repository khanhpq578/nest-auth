import { Injectable } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';
@Injectable()
export class PubSubService {
  constructor() {
    const buffer = Buffer.from(this.credentials, 'base64');
    const credentialDecode = buffer ? buffer.toString() : null;
    const credentialJson = JSON.parse(credentialDecode);

    this.pubSubClient = new PubSub({
      projectId: this.projectId,
      credentials: credentialJson,
    });
  }

  private projectId = process.env.GCLOUD_PROJECT_ID;
  private topicName = process.env.GCLOUD_TOPIC_NAME;
  private credentials = process.env.GCLOUD_CREDENTIAL_B64;

  private pubSubClient: PubSub;

  async publisher(data: any) {
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await this.pubSubClient
      .topic(this.topicName)
      .publish(dataBuffer);
    console.log({}, { [`Massage published in ${this.topicName}`]: messageId });
  }
}

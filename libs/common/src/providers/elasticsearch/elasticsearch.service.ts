import { Client } from '@elastic/elasticsearch';
import { Index, Search } from '@elastic/elasticsearch/api/requestParams';
import { TransportRequestOptions } from '@elastic/elasticsearch/lib/Transport';
import { Configuration } from '@matching/common/config/configuration.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import createAwsElasticsearchConnector from 'aws-elasticsearch-connector';
import AWS from 'aws-sdk';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

@Injectable()
export class ElasticSearchService {
  private logger = new Logger(ElasticSearchService.name);
  private queue = new PQueue({ concurrency: 1 });
  client?: Client;

  constructor(private configService: ConfigService) {
    const config =
      this.configService.get<Configuration['elasticSearch']>('elasticSearch');
    console.log('config elas', config);

    if (config.aws?.accessKeyId) {
      AWS.config.update({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region,
      });
      this.client = new Client({
        ...createAwsElasticsearchConnector(AWS.config),
        node: config.node,
      });
    } else if (config.node)
      this.client = new Client({
        auth: config.auth,
        node: config.node,
      });
    else this.logger.warn('ElasticSearch tracking is not enabled');
  }
  update(index: string, id: string, record: Record<string, any>) {
    console.log(index, id, record);
    if (this.client) {
      this.queue
        .add(() =>
          pRetry(() => this.updateRecord(index, id, record), {
            retries:
              this.configService.get<number>('elasticSearch.retries') ?? 3,
            onFailedAttempt: (error) => {
              this.logger.error(
                `Indexing record failed, retrying (${error.retriesLeft} attempts left)`,
                error.name,
              );
            },
          }),
        )
        .then((r) => {
          console.log('[ELASTICSEARCH] ', r);

          return r;
        })
        .catch((e) => {
          console.log('ee', e);
        });
    }
  }
  updateAll(index: string, record: Record<string, any>) {
    if (this.client) {
      this.queue
        .add(() =>
          pRetry(() => this.updateAllRecord(index, record), {
            retries:
              this.configService.get<number>('elasticSearch.retries') ?? 3,
            onFailedAttempt: (error) => {
              this.logger.error(
                `Indexing record failed, retrying (${error.retriesLeft} attempts left)`,
                error.name,
              );
            },
          }),
        )
        .then((r) => {
          console.log('[ELASTICSEARCH] update All ', r);
          return r;
        })
        .catch((e) => {
          console.log('ee', e);
        });
    }
  }
  index(index: string, record: Record<string, any>, params?: Index) {
    if (this.client)
      this.queue
        .add(() =>
          pRetry(() => this.indexRecord(index, record, params), {
            retries:
              this.configService.get<number>('elasticSearch.retries') ?? 3,
            onFailedAttempt: (error) => {
              this.logger.error(
                `Indexing record failed, retrying (${error.retriesLeft} attempts left)`,
                error.name,
              );
            },
          }),
        )
        .then((r) => {
          // console.log('[ELASTICSEARCH] ', r);
        })
        .catch((e) => {
          console.log('ee', e);
        });
  }
  isMapping(index: string) {
    return this.client.indices.exists({ index });
  }
  putMapping(index: string, mapping: Record<string, any>) {
    if (this.client) {
      this.queue
        .add(() =>
          pRetry(() => this.putMappingRecord(index, mapping), {
            retries:
              this.configService.get<number>('elasticSearch.retries') ?? 3,
            onFailedAttempt: (error) => {
              this.logger.error(
                `Mapping record failed, retrying (${error.retriesLeft} attempts left)`,
                error.name,
              );
            },
          }),
        )
        .then((r) => {
          console.log('[ELASTICSEARCH] ', r);
        })
        .catch((e) => {
          console.log('ee', e);
        });
    }
  }

  search(
    params?: Search<Record<string, any>>,
    options?: TransportRequestOptions,
  ) {
    if (this.client) return this.client.search(params, options);
  }
  searchRaw(
    index: string,
    params?: Record<string, any>,
    options?: TransportRequestOptions,
  ) {
    if (this.client)
      return this.client.search({ index, body: params }, options);
  }
  deleteAllRecords = async (index: string) => {
    if (this.client)
      return this.client.deleteByQuery({
        index,
        body: {
          query: {
            match_all: {},
          },
        },
      });
  };
  /**
   * Delete old records from ElasticSearch
   * @param index - Index
   * @param days - Number of days ago (e.g., 30 will delete month-old data)
   */
  deleteOldRecords = async (index: string, days: number) => {
    const now = new Date();
    now.setDate(now.getDate() - days);
    if (this.client)
      return this.client.deleteByQuery({
        index,
        body: {
          query: {
            bool: {
              must: [
                {
                  range: {
                    date: {
                      lte: now,
                    },
                  },
                },
              ],
            },
          },
        },
      });
  };

  private async indexRecord(
    index: string,
    record: Record<string, any>,
    params?: Index,
  ) {
    delete params.body;
    return this.client.index({ index, body: record, ...params });
  }
  private async putMappingRecord(index: string, mapping: Record<string, any>) {
    return this.client.indices.create({ index, body: mapping });
    // return this.client.indices.putMapping({ index, body: mapping });
  }
  private async updateRecord(
    index: string,
    id: string,
    record: Record<string, any>,
  ) {
    const query = {
      index,
      refresh: true,
      body: {
        query: {
          match: {
            uuid: id,
          },
        },
      },
    };
    return await this.client.updateByQuery(query);
    // return this.client.update({
    //   index,
    //   id: '261d51d1-5c82-4970-8ac7-5d07c8c15c70',
    //   body: record,
    // });
  }
  private async updateAllRecord(index: string, record: Record<string, any>) {
    const query = {
      index,
      refresh: true,
      body: {
        script: {
          source: 'ctx._source.online=false;',
          lang: 'painless',
        },
        query: {
          match_all: {},
        },
      },
    };
    // console.log('updateAllRecord', query);

    return this.client.updateByQuery(query);
  }
}

import { Configuration } from '@matching/common/config/configuration.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { render } from '@staart/mustache-markdown';
import { promises as fs } from 'fs';
import mem from 'mem';
import Mail from 'nodemailer/lib/mailer';
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import { join } from 'path';
import { MailOptions } from './mail.interface';
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transport: Mail;
  private config: Configuration['email'];
  private queue = new PQueue({ concurrency: 1 });
  private readTemplate = mem(this.readTemplateUnmemoized, {
    cacheKey: (arguments_) => arguments_.join(','),
  });
  private senders: unknown;

  constructor(private configService: ConfigService) {
    this.config = this.configService.get<Configuration['email']>('email');
    sgMail.setApiKey(process.env.EMAIL_PASSWORD);

    this.senders = {
      info: process.env.EMAIL_INFO_FROM,
      auth: process.env.EMAIL_AUTH_FROM,
      noreply: process.env.EMAIL_NOREPLY_FROM,
    };

    console.log(this.senders);
    // if (this.config.ses?.accessKeyId)
    //   this.transport = nodemailer.createTransport({
    //     SES: new SES({
    //       apiVersion: '2010-12-01',
    //       accessKeyId: this.config.ses.accessKeyId,
    //       secretAccessKey: this.config.ses.secretAccessKey,
    //       region: this.config.ses.region,
    //     }),
    //   } as SESTransport.Options);
    // else this.transport = nodemailer.createTransport(this.config.transport);
  }

  async send(options: Mail.Options & MailOptions) {
    if (!options.html) {
      options = await this.renderEmail(options);
    }
    // const isDev = this.configService.get('pushNotification.enable');
    // console.log('isdev', isDev, options.mailTo.email.endsWith('yopmail.com'));

    // if (isDev && !options.mailTo.email.endsWith('yopmail.com')) {
    //   console.log('[DEV mode] not send email to ', options.mailTo.email);

    //   return;
    // }
    // console.log('oppppppppppppptions =>>>>>>>>>>>>', options.subject);
    this.queue
      .add(() =>
        pRetry(
          async () => {
            if (!this.senders[options.senderType]) throw 'sender not found';
            // console.log(this.senders[options.senderType]);
            // console.log(options.html);
            // console.log(options.subject);
            const msg = {
              to: options.mailTo, // Change to your recipient
              from: {
                email: this.senders[options.senderType],
                name: 'Ours-' + options.senderType,
              }, // Change to your verified sender
              subject: options.subject,
              //   text: 'and easy to do anywhere, even with Node.js',
              //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
              templateId: 'd-8ff73e75bc7e4ea3af38faf5a969e8a3',
              // options.preferedLanguage === 'vi'
              //   ? 'd-52e8e89246944af18bdf0f87ca8e3a9b' // -> vietnamese
              //   : 'd-f6d8810208fc4313b7f5700dce3d9afa', // -> japanesese
              personalizations: [
                {
                  to: [options.mailTo],
                  dynamic_template_data: {
                    subject: options.subject,
                    content: options.html,
                  },
                },
              ],
            };
            // console.log('msg ================>>>>', msg);
            return sgMail
              .send(msg)
              .then((response) => {
                console.log('status code ==========>', response[0].statusCode);
                // console.log('header ==========>', response[0].headers);
              })
              .catch((error) => {
                console.error('errrrrrrrrrr send mail server =>>>>>>>>', error);
                throw error;
              });
          },
          // this.transport.sendMail({
          //   ...options,
          //   from:
          //     options.from ?? `"${this.config.name}" <${this.config.from}>`,
          // }),
          {
            retries: this.configService.get<number>('email.retries') ?? 3,
            onFailedAttempt: (error) => {
              this.logger.error(
                `Mail to ${options.mailTo} failed, retrying (${error.retriesLeft} attempts left)`,
                error.name,
              );
              console.log(error);
            },
          },
        ),
      )
      .then(() => {})
      .catch(() => {});
  }
  async renderEmail(options: Mail.Options & MailOptions) {
    // console.log('====> renderMail', options);

    if (options.template) {
      // const layout = await this.readTemplate('layout.html');
      let template = await this.readTemplate(
        options.template,
        options.preferedLanguage,
      );

      if (template.startsWith('#')) {
        const subject = template.split('\n', 1)[0].replace('#', '').trim();
        if (subject) {
          options.subject = options.subject ?? subject;
          template = template.replace(`${template.split('\n', 1)[0]}`, '');
          const [subjectMarkdown, _] = render(
            options.subject ?? subject,
            options.data,
          );
          options.subject = subjectMarkdown;
        }
      }
      const [markdown, html] = render(template, options.data);
      options.html = html;
      options.noLayout ? html : '';
      options.text = markdown;
      options.alternatives = [
        {
          contentType: 'text/x-web-markdown',
          content: markdown,
        },
      ];
    }

    return options;
  }

  private async readTemplateUnmemoized(name: string, preferedLanguage = '') {
    // console.log('readTemplateUnmemoized', name, preferedLanguage);

    let searchName = name;
    if (!name.endsWith('.html')) searchName = `${name}.md`;
    // ${
    //   preferedLanguage.length > 0 ? `-${preferedLanguage}` : ''
    // }

    const filePath = join('.', 'templates', searchName);

    // console.log('searchName', searchName);
    console.log('\n reading link', filePath);
    console.log(join('.', 'templates', searchName));

    return fs.readFile(filePath, 'utf8').catch((e) => {
      // fallback to without prefered language if possible
      if (!name.endsWith('.html')) searchName = `${name}.md`;
      return fs.readFile(join('.', 'templates', searchName), 'utf8');
    });
  }
}

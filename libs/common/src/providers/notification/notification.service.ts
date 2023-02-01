// import { MailOptions } from './notification.interface';
import { Notification } from '.prisma/client';
import { USER_NOT_FOUND } from '@matching/common/constants/errors.constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import admin from 'firebase-admin';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationMode,
  NotificationOptions,
} from './notification.interface';

@Injectable()
export class NotificationService {
  constructor(
    private configService: ConfigService,
    private mailService: MailService,
    private prisma: PrismaService, // private configService: // ConfigService,
  ) {}

  getNotificationMode(
    isEmailEnabled: boolean,
    isPushEnabled: boolean,
  ): NotificationMode | null {
    if (isEmailEnabled && isPushEnabled) return NotificationMode.BOTH;
    if (!isEmailEnabled && isPushEnabled)
      return NotificationMode.PUSH_NOTIFICATION;
    if (isEmailEnabled && !isPushEnabled) return NotificationMode.EMAIL;
    return null;
  }

  // TODO: batch push notification requests to improve performance; firebase allows upto 500 device tokens in a single request
  async batchSend(options: NotificationOptions) {
    return;
  }
  async sendBackgroundMessage(
    options: NotificationOptions,
  ): Promise<Notification> {
    const receivingUser = await this.prisma.user.findUnique({
      where: { id: options.receivingUserId },
      include: {
        profile: true,
        prefersEmail: true,
        userSetting: true,
        NotificationToken: true,
      },
    });
    if (!receivingUser) throw new NotFoundException(USER_NOT_FOUND);
    const token = receivingUser.NotificationToken;
    if (!token) return;
    if (token && token.length > 0) {
      await admin.messaging().sendToDevice(
        token.map((e) => e.token), // ['token_1', 'token_2', ...]
        {
          data: options.data ?? {},
        },
        {
          // Required for background/quit data-only messages on iOS
          contentAvailable: true,
          // Required for background/quit data-only messages on Android
          priority: 'high',
        },
      );
    }
  }
  async send(options: NotificationOptions): Promise<Notification> {
    if (!options.receivingUserId) {
      return;
    }
    const receivingUser = await this.prisma.user.findUnique({
      where: { id: options.receivingUserId },
      include: {
        profile: true,
        prefersEmail: true,
        userSetting: true,
        emails: {
          where: {
            deletedFlg: false,
            isVerified: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        NotificationToken: true,
      },
    });
    // console.log('receivingUser', receivingUser);
    // const isDev = this.configService.get('pushNotification.enable');
    // console.log('isdev', isDev);

    // if (
    //   isDev &&
    //   !receivingUser.prefersEmail.emailSafe.endsWith('yopmail.com')
    // ) {
    //   return;
    // }
    if (!receivingUser) throw new NotFoundException(USER_NOT_FOUND);
    const token = receivingUser.NotificationToken;
    // console.log('notification token ===>', token);
    if (!token) return;

    const mailOptions = await this.mailService.renderEmail({
      from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
      senderType: options.senderType,
      data: options.data,
      preferedLanguage:
        receivingUser?.userSetting?.displayLanguage
          ?.toString()
          ?.toLowerCase()
          ?.slice(0, 2) ?? '',
      template: options.template,
    });
    const { subject } = mailOptions;
    let { text } = mailOptions;
    text = text.toString().replace(/<br>/g, '\n');
    // console.log('Title notification =>>>>>>>>>>>>>>>>', subject);
    // console.log('Content notification =>>>>>>>>>>>>>>>>', text);
    const createdNotification = await this.prisma.notification.create({
      data: {
        userId: options.receivingUserId,
        createdBy: options.sendingUserId,
        title: subject,
        content: text.toString(),
        deleteFlg:
          options.notificationMode === NotificationMode.EMAIL ? true : false,
      },
    });
    // console.log(createdNotification);
    if (options?.data) {
      options.data.notificationId = createdNotification.id;
      if (options.data.appendUrlWithNotificationId) {
        options.data.url = options.data.url + '/' + createdNotification.id;
      }
    }

    if (
      token &&
      token.length > 0 &&
      (options.notificationMode === NotificationMode.PUSH_NOTIFICATION ||
        options.notificationMode === NotificationMode.BOTH)
    ) {
      // console.log('Sending to token: ' + JSON.stringify(token));
      // send notification to token with firebase-admin
      let textNotification = text.toString().replace('\n\n', '\n');
      if (textNotification.startsWith('\n')) {
        textNotification = textNotification.substring(1);
      }
      // convert all fields in data to string (firebase requirement)
      const notificationCount = await this.getNotificationCount(
        options.receivingUserId,
      );
      const notificationCountTotal =
        parseInt(notificationCount?.friendRequests ?? 0) +
        parseInt(notificationCount?.messages ?? 0);
      const stringData = {
        ...options.data,
        notificationCount: notificationCountTotal.toString(),
      };
      Object.keys(stringData).forEach((k) => {
        stringData[k] = stringData[k].toString();
      });
      await admin.messaging().sendToDevice(
        token.map((e) => e.token), // ['token_1', 'token_2', ...]
        {
          notification: {
            title: subject,
            body: textNotification,
            badge: notificationCountTotal.toString(),
          },
          data: options.sendDataWithNotification ? stringData : {},
        },
        {
          // Required for background/quit data-only messages on iOS
          contentAvailable: true,
          // Required for background/quit data-only messages on Android
          priority: 'high',
        },
      );
    }
    if (
      options.notificationMode === NotificationMode.EMAIL ||
      options.notificationMode === NotificationMode.BOTH
    ) {
      // send email
      // console.log('send email >>>>', receivingUser.prefersEmail);
      if (
        receivingUser.emails.length > 0 ||
        (receivingUser.prefersEmail && receivingUser.prefersEmail.emailSafe)
      ) {
        // console.log('Sending email to: ', receivingUser.prefersEmail.emailSafe);
        await this.mailService.send({
          ...mailOptions,
          // to: `"${receivingUser?.profile?.nickName ?? 'X'}" <${
          //   receivingUser.prefersEmail.emailSafe
          // }>`,
          mailTo: {
            name: receivingUser?.profile?.nickName ?? 'X',
            email:
              receivingUser?.emails[0]?.emailSafe ??
              receivingUser.prefersEmail.emailSafe,
          },
        });
      }
    }
    // save notification to database
    return createdNotification;
  }

  async getNotificationCount(
    userId: number,
    includingFriendRequests = true,
    includingMessageCount = true,
  ): Promise<any> {
    const excludeHiddenBlockQuery = {
      deleteFlg: false,
      profile: {
        deleteFlg: false,
      },
      partnerHide: {
        // not hidden nor blocked by us
        none: {
          userId: userId,
          deleteFlg: false,
        },
      },
      partnerFacebook: {
        // not blocked (by being facebook friends)
        none: {
          userId: userId,
          deleteFlg: false,
        },
      },
    };
    const result = {};
    // => Số friend request chưa accept
    if (includingFriendRequests) {
      result['friendRequests'] = await this.prisma.matching.count({
        where: {
          partnerId: userId,
          matchingStatus: 'UNANSWERED',
          connectionType: 'SEND_LIKE',
          deleteFlg: false,
          user: {
            // partnerMatching: {
            //   some: {
            //     userId: userId,
            //     connectionType: 'NO_ACTION',
            //   },
            // },
            ...excludeHiddenBlockQuery,
          },
        },
      });
    }
    // => Số tin nhắn chưa đọc từ đối phương
    if (includingMessageCount) {
      result['messages'] = await this.prisma.matchMessages.count({
        where: {
          partnerId: userId,
          isRead: false,
          deleteFlg: false,
          user: {
            ...excludeHiddenBlockQuery,
          },
        },
      });
    }
    return result;
  }
}

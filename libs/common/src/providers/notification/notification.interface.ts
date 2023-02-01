export interface NotificationOptions {
  senderType?: SenderType,
  sendingUserId?: number;
  receivingUserId?: number;
  notificationMode: NotificationMode;
  template?: string;
  preferedLanguage?: string;
  data?: Record<string, any>;
  noLayout?: boolean;
  sendDataWithNotification?: boolean
}

export enum SenderType {
  AUTH = 'auth',
  NOREPLY = 'noreply',
  INFO = 'info',
}

export enum NotificationMode {
  EMAIL = 'EMAIL',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  BOTH = 'BOTH',
}
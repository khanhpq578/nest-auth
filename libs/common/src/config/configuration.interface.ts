import { ApiKeyAuth, BasicAuth } from '@elastic/elasticsearch/lib/pool';
import Stripe from 'stripe';
import moment from 'moment';
export interface Configuration {
  frontendUrl: string;
  kafka: {
    address: string;
  };
  meta: {
    appName: string;
    appUrl: string;
    domainVerificationFile: string;
  };
  redis: {
    CACHE_TTL: number;
    host: string;
    port: number;
  };

  caching: {
    geolocationLruSize: number;
    apiKeyLruSize: number;
  };
  logic: {
    maxLike: number;
    initLike: number;
    day_add_likes: number;
    default_male_like: number;
    timeType_add_likes: moment.unitOfTime.DurationConstructor;
    apple_pass_review: boolean;
  };
  rateLimit: {
    public: { points: number; duration: number };
    authenticated: { points: number; duration: number };
    apiKey: { points: number; duration: number };
  };
  default: {
    lat: number;
    lon: number;
    area: string;
  };
  security: {
    saltRounds: number;
    jwtSecret: string;
    totpWindowPast: number;
    totpWindowFuture: number;
    mfaTokenExpiry: string;
    mergeUsersTokenExpiry: string;
    accessTokenExpiry: string;
    passwordPwnedCheck: boolean;
    unusedRefreshTokenExpiryDays: number;
    inactiveUserDeleteDays: number;
    removedUserDeleteDays: number;
  };

  email: {
    name: string;
    from: string;
    retries: number;
    ses?: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };
    transport?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };

  elasticSearch: {
    node: string;
    retries: number;
    auth?: BasicAuth | ApiKeyAuth;
    aws?: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };
  };
  pushNotification: {
    enable: boolean;
  };
  webhooks: {
    retries: number;
  };

  sms: {
    retries: number;
    twilioAccountSid: string;
    twilioAuthToken: string;
  };

  payments: {
    stripeApiKey: string;
    stripeProductId: string;
    stripeEndpointSecret: string;
    paymentMethodTypes: Array<Stripe.Checkout.SessionCreateParams.PaymentMethodType>;
    apple_password: string;
    test: boolean;
    googleClientSecret: string;
    googleAccToken: string;
    googleRefToken: string;
    googleClientID: string;
  };
  stripe: {
    stripePublishableKey: string;
    stripeWebHookSecret: string;
    stripeSecretKey: string;
  };

  tracking: {
    mode: 'all' | 'api-key' | 'user' | 'api-key-or-user';
    index: string;
    deleteOldLogs: boolean;
    deleteOldLogsDays: number;
  };

  slack: {
    token: string;
    slackApiUrl?: string;
    rejectRateLimitedCalls?: boolean;
    retries: number;
  };

  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    profilePictureBucket?: string;
    profilePictureCdnHostname?: string;
  };

  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };

  github: {
    auth: string;
    userAgent?: string;
  };

  googleMaps: {
    apiKey: string;
  };

  gravatar: {
    enabled: boolean;
  };
}

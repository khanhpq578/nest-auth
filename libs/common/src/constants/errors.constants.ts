export const USER_NOT_FOUND = '404001: User not found';
export const GROUP_NOT_FOUND = '404002: Group not found';
export const SESSION_NOT_FOUND = '404003: Session not found';
export const EMAIL_NOT_FOUND = '404004: Email not found';
export const API_KEY_NOT_FOUND = '404005: API key not found';
export const APPROVED_SUBNET_NOT_FOUND = '404006: Approved subnet not found';
export const AUDIT_LOG_NOT_FOUND = '404007: Audit log not found';
export const DOMAIN_NOT_FOUND = '404008: Domain not found';
export const MEMBERSHIP_NOT_FOUND = '404009: Membership not found';
export const BILLING_NOT_FOUND = '404010: Billing not found';
export const CUSTOMER_NOT_FOUND = '404011: Customer not found';
export const INVOICE_NOT_FOUND = '404012: Invoice not found';
export const SUBSCRIPTION_NOT_FOUND = '404013: Subscription not found';
export const SOURCE_NOT_FOUND = '404014: Source not found';
export const WEBHOOK_NOT_FOUND = '404015: Webhook not found';
export const USER_PROFILE_NOT_FOUND = '404016: User profile not found';

export const UNAUTHORIZED_RESOURCE = '401000: Insufficient permission';
export const INVALID_CREDENTIALS = '401001: Invalid credentials';
export const INVALID_MFA_CODE = '401002: Invalid one-time code';
export const INVALID_TOKEN = '401003: Invalid token';
export const UNVERIFIED_EMAIL = '401004: Email is not verified';
export const UNVERIFIED_LOCATION = '401005: Location is not verified';
export const MFA_BACKUP_CODE_USED = '401007: Backup code is already used';

export const NO_TOKEN_PROVIDED = '400001: No token provided';
export const DOMAIN_NOT_VERIFIED = '400002: Domain not verified';
export const MFA_PHONE_NOT_FOUND = '400003: Phone number not found';
export const MFA_PHONE_OR_TOKEN_REQUIRED =
  '400004: Phone number or token is required';
export const MFA_NOT_ENABLED =
  '400005: Multi-factor authentication is not enabled';
export const NO_EMAILS = '400006: User has no email attached to it';
export const CURRENT_PASSWORD_REQUIRED = '400007: Current password is required';
export const COMPROMISED_PASSWORD =
  '400008: This password has been compromised in a data breach.';
export const CANNOT_DELETE_SOLE_MEMBER =
  '400009: Cannot remove the only member';
export const CANNOT_DELETE_SOLE_OWNER = '400010: Cannot remove the only owner';
export const ORDER_BY_ASC_DESC = '400011: Invalid sorting order';
export const ORDER_BY_FORMAT = '400012: Invalid ordering format';
export const WHERE_PIPE_FORMAT = '400013: Invalid query format';
export const OPTIONAL_INT_PIPE_NUMBER = '400014: $key should be a number';
export const CURSOR_PIPE_FORMAT = '400015: Invalid cursor format';
export const EMAIL_DELETE_PRIMARY = '400016: Cannot delete primary email';
export const CANNOT_UPDATE_ROLE_SOLE_OWNER =
  '400017: Cannot change the role of the only owner';
export const INVALID_DOMAIN = '400018: Invalid domain';
export const SELECT_INCLUDE_PIPE_FORMAT = '400019: Invalid query format';
export const FILE_TOO_LARGE = '400022: Uploaded file is too large';
export const INVALID_IMAGE_INDEXES_FORMAT =
  '400023: Invalid image indexes format';
export const NUMBER_OF_FILES_EXCEEDED = '400024: Number of files exceeded';

export const EMAIL_USER_CONFLICT =
  '409001: User with this email already exists';
export const EMAIL_VERIFIED_CONFLICT = '409002: This email is already verified';
export const BILLING_ACCOUNT_CREATED_CONFLICT =
  '409003: Billing account is already created';
export const MFA_ENABLED_CONFLICT =
  '409004: Multi-factor authentication is already enabled';
export const MERGE_USER_CONFLICT = '409005: Cannot merge the same user';
export const USER_PROFILE_CONFLICT = '409006: This user already has a profile';
export const NUMBER_OF_LIKES_CONFLICT = '409007: This user ran out of likes';

export const RATE_LIMIT_EXCEEDED = '429000: Rate limit exceeded';

export const FACEBOOK_USER_CONFLICT =
  '410001: User using this facebook account already exists';
export const FACEBOOK_TOKEN_INVALID = '410002: Facebook access token invalid';

export const APPLE_USER_CONFLICT =
  '410003: User using this Apple account already exists';
export const APPLE_TOKEN_INVALID = '410004: Apple access token invalid';

export const GOOGLE_USER_CONFLICT =
  '410006: User using this Google account already exists';
export const GOOGLE_TOKEN_INVALID = '410005: Google access token invalid';

export const FAVORITE_EXIST = '420001: User already in favorite list';
export const FAVORITE_NOT_EXIST =
  "420002: Can't unmark, user is not in favorite list";

export const PROFILE_APPROVAL_REQUEST_NOT_FOUND =
  '404017: Profile approval request not found';
export const IMAGE_APPROVAL_REQUEST_NOT_FOUND =
  '404018: Image approval request not found';

export const BANNER_NOT_FOUND = '404019: Banner not found';

export const FILE_FORMAT_INCORRECT = '400026: File format incorrect';

export const TOKEN_NOT_FOUND = '404020: Notification token not provided';

export const MESSAGE_CONTAINED_PROHIBITED_WORD =
  '400025: Message contained prohibited word';
export const NOTIFICATION_NOT_FOUND = '404021: Notification not found';

export const CONFIG_NOT_FOUND = 'Config key not found';
export const ALREADY_LIKED_THIS_PARTNER =
  '400027: You already liked this partner';

export const ONLY_ADMIN_CAN_LOG_IN = '400028: Only admin can log in this page';
export const NEED_PASSWORD_TO_LOG_IN =
  '400029: You can not log in as admin without password';
export const REFERRAL_CODE_NOT_FOUND = '400030: Referral code not found';
export const AMAZON_GIFT_CODE_NOT_FOUND = '400031: Amazon gift code not found';
export const EVENT_NOT_FOUND = '400032: Event not found';

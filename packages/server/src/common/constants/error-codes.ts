export const ErrorCodes = {
  // Auth
  AUTH_001: { code: 'AUTH_001', message: 'Invalid credentials' },
  AUTH_002: { code: 'AUTH_002', message: 'Token expired' },
  AUTH_003: { code: 'AUTH_003', message: 'Invalid refresh token' },
  AUTH_004: { code: 'AUTH_004', message: 'Account banned' },
  AUTH_005: { code: 'AUTH_005', message: 'Account already linked' },
  AUTH_006: { code: 'AUTH_006', message: 'Social account already used' },
  // Player
  PLAYER_001: { code: 'PLAYER_001', message: 'Player not found' },
  PLAYER_002: { code: 'PLAYER_002', message: 'Nickname already taken' },
  // Reward
  REWARD_001: { code: 'REWARD_001', message: 'Already claimed today' },
  REWARD_002: { code: 'REWARD_002', message: 'First login bonus already claimed' },
  REWARD_003: { code: 'REWARD_003', message: 'Reward config not found' },
  // Coupon
  COUPON_001: { code: 'COUPON_001', message: 'Invalid coupon code' },
  COUPON_002: { code: 'COUPON_002', message: 'Coupon expired' },
  COUPON_003: { code: 'COUPON_003', message: 'Coupon already redeemed' },
  COUPON_004: { code: 'COUPON_004', message: 'Coupon not for this player' },
  COUPON_005: { code: 'COUPON_005', message: 'Max redemptions reached' },
  // Payment
  PAYMENT_001: { code: 'PAYMENT_001', message: 'Invalid receipt' },
  PAYMENT_002: { code: 'PAYMENT_002', message: 'Already fulfilled' },
  PAYMENT_003: { code: 'PAYMENT_003', message: 'Product not found' },
  PAYMENT_004: { code: 'PAYMENT_004', message: 'Receipt verification failed' },
  // Currency
  CURRENCY_001: { code: 'CURRENCY_001', message: 'Insufficient balance' },
  // Admin
  ADMIN_001: { code: 'ADMIN_001', message: 'Unauthorized admin access' },
  ADMIN_002: { code: 'ADMIN_002', message: 'Admin account not found' },
  ADMIN_003: { code: 'ADMIN_003', message: 'Admin account inactive' },
  ADMIN_004: { code: 'ADMIN_004', message: 'Invalid Google token' },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.BACKEND_PORT || 3001,
  host: process.env.BACKEND_HOST || 'localhost',

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  policies: {
    maxLoanDays: parseInt(process.env.MAX_LOAN_DAYS) || 14,
    maxRenewals: parseInt(process.env.MAX_RENEWALS) || 1,
    finePerDay: parseFloat(process.env.FINE_PER_DAY) || 1000,
    notificationDaysBefore: parseInt(process.env.NOTIFICATION_DAYS_BEFORE) || 2,
  },

  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockTime: parseInt(process.env.LOCK_TIME) || 15,
  },
};

export default config;

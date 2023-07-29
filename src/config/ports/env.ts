export interface IApiEnv {
  PORT: number;
  MONGO_URI: string;
  MONGO_TEST_URI?: string;
  JWT_SECRET: string;
  NODEMAILER_USER: string;
  NODEMAILER_PASS: string;
  NODEMAILER_TEST_USER?: string;
  NODEMAILER_TEST_PASS?: string;
  API_BASE_URL: string;
  DEFAULT_ENCRYPTOR_SALTS: number;
  ACCESS_TOKEN_EXPIRES_IN: number;
  REFRESH_TOKEN_EXPIRES_IN: number;
  CONFIRM_EMAIL_TOKEN_EXPIRES_IN: number;
  NODEMAILER_HOST: string;
  NODEMAILER_PORT: number;
  NODEMAILER_SECURE: boolean;
  NODEMAILER_TEST_HOST?: string;
  NODEMAILER_TEST_PORT?: number;
  NODEMAILER_TEST_SECURE?: boolean;
}

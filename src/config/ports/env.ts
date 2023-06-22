export interface IApiEnv {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  NODEMAILER_USER: string;
  NODEMAILER_PASS: string;
  NODEMAILER_TEST_USER: string;
  NODEMAILER_TEST_PASS: string;
  API_BASE_URL: string;
}

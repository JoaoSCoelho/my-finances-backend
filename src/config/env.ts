import { IApiEnv } from './ports/env';

// Check if exists all required env's

if (!process.env.PORT || isNaN(Number(process.env.PORT)))
  throw console.error('Missing env PORT');
if (!process.env.MONGO_URI) throw console.error('Missing env MONGO_URI');
if (!process.env.JWT_SECRET) throw console.error('Missing env JWT_SECRET');
if (!process.env.NODEMAILER_USER)
  throw console.error('Missing env NODEMAILER_USER');
if (!process.env.NODEMAILER_PASS)
  throw console.error('Missing env NODEMAILER_PASS');

// if (!process.env.NODEMAILER_TEST_USER)
//   throw console.error('Missing env NODEMAILER_TEST_USER');
// if (!process.env.NODEMAILER_TEST_PASS)
//   throw console.error('Missing env NODEMAILER_TEST_PASS');

if (!process.env.API_BASE_URL) throw console.error('Missing env API_BASE_URL');
if (
  !process.env.DEFAULT_ENCRYPTOR_SALTS ||
  isNaN(Number(process.env.DEFAULT_ENCRYPTOR_SALTS))
)
  throw console.error('Missing env DEFAULT_ENCRYPTOR_SALTS');
if (
  !process.env.ACCESS_TOKEN_EXPIRES_IN ||
  isNaN(Number(process.env.ACCESS_TOKEN_EXPIRES_IN))
)
  throw console.error('Missing env ACCESS_TOKEN_EXPIRES_IN');
if (
  !process.env.REFRESH_TOKEN_EXPIRES_IN ||
  isNaN(Number(process.env.REFRESH_TOKEN_EXPIRES_IN))
)
  throw console.error('Missing env REFRESH_TOKEN_EXPIRES_IN');
if (
  !process.env.CONFIRM_EMAIL_TOKEN_EXPIRES_IN ||
  isNaN(Number(process.env.CONFIRM_EMAIL_TOKEN_EXPIRES_IN))
)
  throw console.error('Missing env CONFIRM_EMAIL_TOKEN_EXPIRES_IN');
if (!process.env.NODEMAILER_HOST)
  throw console.error('Missing env NODEMAILER_HOST');
if (!process.env.NODEMAILER_PORT || isNaN(Number(process.env.NODEMAILER_PORT)))
  throw console.error('Missing env NODEMAILER_PORT');
if (
  !process.env.NODEMAILER_SECURE ||
  !['true', 'false'].includes(process.env.NODEMAILER_SECURE)
)
  throw console.error('Missing env NODEMAILER_SECURE');

export const apiEnv: IApiEnv = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URI: process.env.MONGO_URI,
  MONGO_TEST_URI: process.env.MONGO_TEST_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS,
  NODEMAILER_TEST_USER: process.env.NODEMAILER_TEST_USER,
  NODEMAILER_TEST_PASS: process.env.NODEMAILER_TEST_PASS,
  API_BASE_URL: process.env.API_BASE_URL,
  DEFAULT_ENCRYPTOR_SALTS: Number(process.env.DEFAULT_ENCRYPTOR_SALTS),
  ACCESS_TOKEN_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
  REFRESH_TOKEN_EXPIRES_IN: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
  CONFIRM_EMAIL_TOKEN_EXPIRES_IN: Number(
    process.env.CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
  ),
  NODEMAILER_HOST: process.env.NODEMAILER_HOST,
  NODEMAILER_PORT: Number(process.env.NODEMAILER_PORT),
  NODEMAILER_SECURE: JSON.parse(process.env.NODEMAILER_SECURE),
  NODEMAILER_TEST_HOST: process.env.NODEMAILER_TEST_HOST,
  NODEMAILER_TEST_PORT: Number(process.env.NODEMAILER_TEST_PORT),
  NODEMAILER_TEST_SECURE:
    process.env.NODEMAILER_TEST_SECURE &&
    JSON.parse(process.env.NODEMAILER_TEST_SECURE),
};

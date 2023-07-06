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
if (!process.env.NODEMAILER_TEST_USER)
  throw console.error('Missing env NODEMAILER_TEST_USER');
if (!process.env.NODEMAILER_TEST_PASS)
  throw console.error('Missing env NODEMAILER_TEST_PASS');
if (!process.env.API_BASE_URL) throw console.error('Missing env API_BASE_URL');

export const apiEnv: IApiEnv = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS,
  NODEMAILER_TEST_USER: process.env.NODEMAILER_TEST_USER,
  NODEMAILER_TEST_PASS: process.env.NODEMAILER_TEST_PASS,
  API_BASE_URL: process.env.API_BASE_URL,
};

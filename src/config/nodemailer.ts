import nodemailer from 'nodemailer';

import { apiEnv } from './env';

const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === 'test'
    ? {
        host: apiEnv.NODEMAILER_TEST_HOST,
        port: apiEnv.NODEMAILER_TEST_PORT,
        auth: {
          user: apiEnv.NODEMAILER_TEST_USER,
          pass: apiEnv.NODEMAILER_TEST_PASS,
        },
      }
    : {
        host: apiEnv.NODEMAILER_HOST,
        port: apiEnv.NODEMAILER_PORT,
        secure: apiEnv.NODEMAILER_SECURE,
        auth: {
          user: apiEnv.NODEMAILER_USER,
          pass: apiEnv.NODEMAILER_PASS,
        },
      },
);

export { transporter };

import nodemailer from 'nodemailer';

import config from '../../config.json';
import { apiEnv } from './env';

const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === 'test'
    ? {
        host: config.nodemailer_test_host,
        port: config.nodemailer_test_port,
        auth: {
          user: apiEnv.NODEMAILER_TEST_USER,
          pass: apiEnv.NODEMAILER_TEST_PASS,
        },
      }
    : {
        host: config.nodemailer_host,
        port: config.nodemailer_port,
        secure: config.nodemailer_secure,
        auth: {
          user: apiEnv.NODEMAILER_USER,
          pass: apiEnv.NODEMAILER_PASS,
        },
      },
);

export { transporter };

import nodemailer from 'nodemailer';

import { apiEnv } from './env';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: apiEnv.NODEMAILER_USER,
    pass: apiEnv.NODEMAILER_PASS,
  },
});

export { transporter };

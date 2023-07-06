import { apiEnv } from '../../config/env';
import { EmailProvider, SendMethod } from '../ports/email-provider';

export class Nodemailer implements EmailProvider {
  send: SendMethod = async (transporter, to, subject, text, html) => {
    const message = await transporter.sendMail({
      from: `"My Finances" <${
        process.env.NODE_ENV === 'test'
          ? apiEnv.NODEMAILER_TEST_USER
          : apiEnv.NODEMAILER_USER
      }>`,
      to,
      subject,
      text,
      html,
    });

    return message;
  };
}

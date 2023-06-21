import { compareSync } from 'bcrypt';

import { EmailProvider, SendMethod } from '../ports/email-provider';
import { CompareMethod } from '../ports/encryptor-provider';

export class Nodemailer implements EmailProvider {
  send: SendMethod = (transporter, to, subject, text, html) => {
    return transporter.sendMail({
      from: '"My Finances" <contact.myfinances@gmail.com>',
      to,
      subject,
      text,
      html,
    });
  };

  compare: CompareMethod = compareSync;
}

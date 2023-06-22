import { readFileSync } from 'fs';

import config from '../../config.json';
import { apiEnv } from '../config/env';
import { transporter } from '../config/nodemailer';
import { EmailProvider } from '../external/ports/email-provider';
import { TokenManager } from '../external/ports/token-manager';
import { ExecuteMethod } from './ports/send-email-confirmation';

export class SendEmailConfirmationUC {
  constructor(
    private emailProvider: EmailProvider,
    private tokenManager: TokenManager,
  ) {}

  execute: ExecuteMethod = async (user) => {
    const emailTemplate = readFileSync(
      './src/templates/confirm-email.html',
    ).toString();

    const confirmEmailToken = this.tokenManager.generate(
      { userID: user.id.value, type: 'confirm-email' },
      apiEnv.JWT_SECRET,
      60 * 60 * config.confirm_email_token_expires_in,
    );

    const emailContent = emailTemplate
      .replaceAll('VAR_USERNAME', user.username.value)
      .replaceAll(
        'VAR_CONFIRM_LINK',
        apiEnv.API_BASE_URL + '/api/confirmemail/' + confirmEmailToken,
      );

    await this.emailProvider.send(
      transporter,
      user.email.value,
      `Confirme seu email ${user.username.value}! <My Finances>`,
      undefined,
      emailContent,
    );
  };
}
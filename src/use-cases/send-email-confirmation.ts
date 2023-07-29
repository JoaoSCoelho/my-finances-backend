import { readFileSync } from 'fs';

import { apiEnv } from '../config/env';
import { transporter } from '../config/nodemailer';
import { User } from '../entities/user';
import { EmailProvider } from '../external/ports/email-provider';
import { TokenManager } from '../external/ports/token-manager';

export class SendEmailConfirmationUC {
  constructor(
    private emailProvider: EmailProvider,
    private tokenManager: TokenManager,
  ) {}

  async execute(user: User) {
    const emailTemplate = readFileSync(
      './src/templates/confirm-email.html',
    ).toString();

    const confirmEmailToken = this.tokenManager.generate(
      { userID: user.id.value, type: 'confirm-email' },
      apiEnv.JWT_SECRET,
      60 * 60 * apiEnv.CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
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
  }
}

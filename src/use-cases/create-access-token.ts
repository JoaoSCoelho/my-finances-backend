import config from '../../config.json';
import { apiEnv } from '../config/env';
import { User } from '../entities/user';
import { TokenManager } from '../external/ports/token-manager';

export class CreateAccessTokenUC {
  constructor(private tokenManager: TokenManager) {}

  execute = (user: User) => {
    return this.tokenManager.generate(
      {
        userID: user.id.value,
        type: 'access',
        confirmedEmail: user.confirmedEmail.value,
      },
      apiEnv.JWT_SECRET,
      60 * 60 * config.access_token_expires_in,
    );
  };
}

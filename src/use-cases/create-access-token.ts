import config from '../../config.json';
import { apiEnv } from '../config/env';
import { TokenManager } from '../external/ports/token-manager';
import { ExecuteMethod } from './ports/create-access-token';

export class CreateAccessTokenUC {
  constructor(private tokenManager: TokenManager) {}

  execute: ExecuteMethod = (user) => {
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

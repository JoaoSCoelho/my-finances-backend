import config from '../../config.json';
import { apiEnv } from '../config/env';
import { TokenManager } from '../external/ports/token-manager';
import { ExecuteMethod } from './ports/create-auth-token';

export class CreateAuthTokenUC {
  constructor(private tokenManager: TokenManager) {}

  execute: ExecuteMethod = (userID) => {
    return this.tokenManager.generate(
      { userID },
      apiEnv.JWT_SECRET,
      60 * 60 * config.auth_token_expires_in,
    );
  };
}

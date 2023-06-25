import config from '../../config.json';
import { apiEnv } from '../config/env';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { TokenManager } from '../external/ports/token-manager';
import { UsersRepository } from '../external/ports/users-repository';
import { left, right } from '../shared/either';
import { ExecuteMethod } from './ports/create-refresh-token';

export class CreateRefreshTokenUC {
  constructor(
    private tokenManager: TokenManager,
    private usersRepository: UsersRepository,
  ) {}

  execute: ExecuteMethod = async (user) => {
    const refreshToken = this.tokenManager.generate(
      {
        userID: user.id.value,
        type: 'refresh',
      },
      apiEnv.JWT_SECRET,
      60 * 60 * config.refresh_token_expires_in,
    );

    const eitherUserObject = await this.usersRepository.pushItemToProp(
      user.id.value,
      'refreshTokens',
      refreshToken,
    );

    if (eitherUserObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('user', 'id', user.id.value),
      );

    return right(refreshToken);
  };
}

import { apiEnv } from '../config/env';
import { User } from '../entities/user';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { TokenManager } from '../external/ports/token-manager';
import { UsersRepository } from '../external/ports/users-repository';
import { Either, left, right } from '../shared/either';

export class CreateRefreshTokenUC {
  constructor(
    private tokenManager: TokenManager,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    user: User,
  ): Promise<Either<ThereIsNoEntityWithThisPropError, string>> {
    const refreshToken = this.tokenManager.generate(
      {
        userID: user.id.value,
        type: 'refresh',
      },
      apiEnv.JWT_SECRET,
      60 * 60 * apiEnv.REFRESH_TOKEN_EXPIRES_IN,
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
  }
}

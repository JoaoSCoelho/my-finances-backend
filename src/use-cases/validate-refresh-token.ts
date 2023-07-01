import { apiEnv } from '../config/env';
import { User } from '../entities/user';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import {
  GenericPayload,
  IRefreshTokenPayload,
  TokenManager,
} from '../external/ports/token-manager';
import { UsersRepository } from '../external/ports/users-repository';
import { AnyString } from '../object-values/any-string';
import { Either, left, right } from '../shared/either';

export class ValidateRefreshTokenUC {
  constructor(
    private usersRepository: UsersRepository,
    private tokenManager: TokenManager,
  ) {}

  async execute(
    refreshToken: any,
  ): Promise<
    Either<
      InvalidParamError | ThereIsNoEntityWithThisPropError | ServerError,
      User
    >
  > {
    const eitherRefreshToken = AnyString.create(refreshToken);

    if (eitherRefreshToken.isLeft())
      return left(
        new InvalidParamError(
          'refreshToken',
          refreshToken,
          eitherRefreshToken.value.reason,
          eitherRefreshToken.value.expected,
        ),
      );

    try {
      const payload = this.tokenManager.verify(
        refreshToken,
        apiEnv.JWT_SECRET,
      ) as GenericPayload | IRefreshTokenPayload;

      if (payload.type !== 'refresh')
        return left(
          new InvalidParamError(
            'refreshToken',
            refreshToken,
            'type not supported',
            'refresh',
          ),
        );

      const eitherUserObject = await this.usersRepository.getById(
        payload.userID,
      );

      if (eitherUserObject.isLeft())
        return left(
          new ThereIsNoEntityWithThisPropError('user', 'id', payload.userID),
        );

      const eitherUser = User.create(eitherUserObject.value);

      if (eitherUser.isLeft()) return left(new ServerError());

      const user = eitherUser.value;

      if (!user.value.refreshTokens.includes(refreshToken))
        return left(
          new InvalidParamError(
            'refreshToken',
            refreshToken,
            'invalid',
            'A valid token',
          ),
        );

      const indexOfRT = user.value.refreshTokens.indexOf(refreshToken);

      const updatedRefreshTokens = user.value.refreshTokens;

      updatedRefreshTokens.splice(indexOfRT, 1);

      try {
        await this.usersRepository.updateProp(
          user.id.value,
          'refreshTokens',
          updatedRefreshTokens,
        );
      } catch (error) {
        return left(new ServerError());
      }

      const eitherUpdatedUser = User.create({
        ...user.value,
        refreshTokens: updatedRefreshTokens,
      });

      if (eitherUpdatedUser.isLeft()) return left(new ServerError());

      const updatedUser = eitherUpdatedUser.value;

      return right(updatedUser);
    } catch (err: any) {
      if (err.message === 'jwt expired')
        return left(
          new InvalidParamError(
            'refreshToken',
            refreshToken,
            'expired',
            'A non expired token',
          ),
        );
      else
        return left(
          new InvalidParamError(
            'refreshToken',
            refreshToken,
            'invalid',
            'A valid token',
          ),
        );
    }
  }
}

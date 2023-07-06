import { apiEnv } from '../config/env';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import {
  IConfirmEmailPayload,
  TokenManager,
} from '../external/ports/token-manager';
import { UsersRepository } from '../external/ports/users-repository';
import { Either, left, right } from '../shared/either';

export class ConfirmEmailUC {
  constructor(
    private tokenManager: TokenManager,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    token: string,
  ): Promise<
    Either<InvalidParamError | ThereIsNoEntityWithThisPropError, void>
  > {
    try {
      const payload = this.tokenManager.verify(
        token,
        apiEnv.JWT_SECRET,
      ) as IConfirmEmailPayload;

      if (payload.type !== 'confirm-email')
        return left(
          new InvalidParamError(
            'confirmEmailToken',
            token,
            'type not supported',
            'confirm-email',
          ),
        );

      const eitherUserObject = await this.usersRepository.updateProp(
        payload.userID,
        'confirmedEmail',
        true,
      );

      if (eitherUserObject.isLeft())
        return left(
          new ThereIsNoEntityWithThisPropError('user', 'id', payload.userID),
        );

      return right(undefined);
    } catch (err: any) {
      if (err.message === 'jwt expired')
        return left(
          new InvalidParamError(
            'confirmEmailToken',
            token,
            'expired',
            'A confirmEmailToken with an expiration date greater than now',
          ),
        );
      else
        return left(
          new InvalidParamError(
            'confirmEmailToken',
            token,
            'incorrect structure',
            'A valid token',
          ),
        );
    }
  }
}

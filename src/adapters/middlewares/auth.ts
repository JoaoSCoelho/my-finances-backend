import { apiEnv } from '../../config/env';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { MissingParamError } from '../../errors/missing-param-error';
import {
  IAccessTokenPayload,
  TokenManager,
} from '../../external/ports/token-manager';
import { next, unauthorized } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class AuthMiddleware implements Adapter {
  constructor(private tokenManager: TokenManager) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const { authorization } = httpRequest.headers;

    if (!authorization)
      return unauthorized(new MissingParamError('authorization'));

    const parts = authorization.split(' ');

    if (parts.length !== 2)
      return unauthorized(
        new InvalidParamError(
          'authorization',
          authorization,
          'incorrect structure',
          '2 parts',
        ),
      );

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme))
      return unauthorized(
        new InvalidParamError(
          'authorization',
          authorization,
          'incorrect structure',
          'First part equal to "Bearer"',
        ),
      );

    try {
      const payload = this.tokenManager.verify(
        token,
        apiEnv.JWT_SECRET,
      ) as IAccessTokenPayload;

      if (payload.type !== 'access')
        return unauthorized(
          new InvalidParamError(
            'accessToken',
            token,
            'type not supported',
            'access',
          ),
        );

      return next({
        nextData: {
          auth: payload,
        },
      });
    } catch (err: any) {
      if (err.message === 'jwt expired') {
        return unauthorized(
          new InvalidParamError(
            'accessToken',
            token,
            'expired',
            'A accessToken with an expiration date greater than now',
          ),
        );
      } else {
        return unauthorized(
          new InvalidParamError(
            'accessToken',
            token,
            'incorrect structure',
            'A valid token',
          ),
        );
      }
    }
  };
}

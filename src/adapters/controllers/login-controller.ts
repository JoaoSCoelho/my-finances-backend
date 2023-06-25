import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateAccessTokenUC } from '../../use-cases/create-access-token';
import { CreateRefreshTokenUC } from '../../use-cases/create-refresh-token';
import { LoginUC } from '../../use-cases/login';
import {
  badRequest,
  ok,
  serverError,
  unauthorized,
} from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class LoginController implements Adapter {
  constructor(
    private loginUC: LoginUC,
    private createAccessTokenUC: CreateAccessTokenUC,
    private createRefreshTokenUC: CreateRefreshTokenUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const eitherBody = AnyObject.create(httpRequest.body);

    if (eitherBody.isLeft()) {
      const {
        value: { reason, expected },
      } = eitherBody;

      return badRequest(
        new InvalidParamError('body', httpRequest.body, reason, expected),
      );
    }

    const { value: body } = eitherBody.value;

    const eitherUser = await this.loginUC.execute(body.email, body.password);

    if (eitherUser.isLeft()) {
      if (eitherUser.value.name === 'Server error')
        return serverError(eitherUser.value);
      if (eitherUser.value.name === 'Invalid credentials')
        return unauthorized(eitherUser.value);
      return badRequest(eitherUser.value);
    }

    const user = eitherUser.value;

    const accessToken = this.createAccessTokenUC.execute(user);

    const eitherRefreshToken = await this.createRefreshTokenUC.execute(user);

    if (eitherRefreshToken.isLeft()) return serverError(new ServerError());

    const refreshToken = eitherRefreshToken.value;

    return ok({
      accessToken,
      refreshToken,
      user: user.noConfidentialValue,
    });
  };
}

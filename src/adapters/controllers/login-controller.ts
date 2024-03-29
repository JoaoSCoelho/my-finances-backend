import { ServerError } from '../../errors/server-error';
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
    const eitherUser = await this.loginUC.execute(
      httpRequest.body.email,
      httpRequest.body.password,
    );

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

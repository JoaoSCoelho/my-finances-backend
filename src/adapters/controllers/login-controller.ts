import { InvalidParamError } from '../../errors/invalid-param-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateAuthTokenUC } from '../../use-cases/create-auth-token';
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
    private createAuthTokenUC: CreateAuthTokenUC,
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

    const authToken = this.createAuthTokenUC.execute(user.id.value);

    return ok({
      token: authToken,
      user: user.noHashPassValue,
    });
  };
}

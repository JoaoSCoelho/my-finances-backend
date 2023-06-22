import { InvalidParamError } from '../../errors/invalid-param-error';
import { MissingParamError } from '../../errors/missing-param-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateAuthTokenUC } from '../../use-cases/create-auth-token';
import { CreateUserUC } from '../../use-cases/create-user';
import { SendEmailConfirmationUC } from '../../use-cases/send-email-confirmation';
import { badRequest, created } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateUserController implements Adapter {
  constructor(
    private createUser: CreateUserUC,
    private createAuthToken: CreateAuthTokenUC,
    private sendEmailConfirmation: SendEmailConfirmationUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    // Validates the request body as an object

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

    if (!('email' in body)) return badRequest(new MissingParamError('email'));
    if (!('username' in body))
      return badRequest(new MissingParamError('username'));
    if (!('password' in body))
      return badRequest(new MissingParamError('password'));

    // Create an user in the database

    const eitherUser = await this.createUser.execute({
      email: body.email,
      password: body.password,
      username: body.username,
    });

    if (eitherUser.isLeft()) return badRequest(eitherUser.value);

    const user = eitherUser.value;

    const authToken = this.createAuthToken.execute(user.id.value);

    await this.sendEmailConfirmation.execute(user);

    return created({
      user: user.noHashPassValue,
      token: authToken,
    });
  };
}

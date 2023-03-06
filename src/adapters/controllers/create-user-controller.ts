import { InvalidParamError } from '../../errors/invalid-param-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateAuthTokenUC } from '../../use-cases/create-auth-token';
import { CreateUserUC } from '../../use-cases/create-user';
import { badRequest, created } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateUserController implements Adapter {
  constructor(
    private createUser: CreateUserUC,
    private createAuthToken: CreateAuthTokenUC,
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

    // Create an user in the database

    const eitherUser = await this.createUser.execute({
      email: body.email,
      password: body.password,
      username: body.username,
    });

    if (eitherUser.isLeft()) return badRequest(eitherUser.value);

    const user = eitherUser.value;

    const authToken = this.createAuthToken.execute(user.id.value);

    return created({
      user: {
        id: user.value.id,
        username: user.value.username,
        email: user.value.email,
        confirmedEmail: user.value.confirmedEmail,
        createdTimestamp: user.value.createdTimestamp,
      },
      token: authToken,
    });
  };
}

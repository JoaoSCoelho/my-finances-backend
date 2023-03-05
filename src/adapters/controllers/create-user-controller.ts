import { InvalidParamError } from '../../errors/invalid-param-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateUserUC } from '../../use-cases/create-user';
import { badRequest, created } from '../helpers/http-helper';
import { Controller, ControllerHandleMethod } from '../ports/controller';

export class CreateUserController implements Controller {
  constructor(private createUser: CreateUserUC) {}

  handle: ControllerHandleMethod = async (httpRequest) => {
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

    return created({
      user: {
        id: user.value.id,
        username: user.value.username,
        email: user.value.email,
        confirmedEmail: user.value.confirmedEmail,
        createdTimestamp: user.value.createdTimestamp,
      },
    });
  };
}

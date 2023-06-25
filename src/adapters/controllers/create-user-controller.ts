import { InvalidParamError } from '../../errors/invalid-param-error';
import { MissingParamError } from '../../errors/missing-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateAccessTokenUC } from '../../use-cases/create-access-token';
import { CreateRefreshTokenUC } from '../../use-cases/create-refresh-token';
import { CreateUserUC } from '../../use-cases/create-user';
import { SendEmailConfirmationUC } from '../../use-cases/send-email-confirmation';
import { badRequest, created, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateUserController implements Adapter {
  constructor(
    private createUser: CreateUserUC,
    private createAccessToken: CreateAccessTokenUC,
    private sendEmailConfirmation: SendEmailConfirmationUC,
    private createRefreshToken: CreateRefreshTokenUC,
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

    await this.sendEmailConfirmation.execute(user);

    const accessToken = this.createAccessToken.execute(user);

    const eitherRefreshToken = await this.createRefreshToken.execute(user);

    if (eitherRefreshToken.isLeft()) return serverError(new ServerError());

    const refreshToken = eitherRefreshToken.value;

    return created({
      user: user.noConfidentialValue,
      accessToken,
      refreshToken,
    });
  };
}

import { MissingParamError } from '../../errors/missing-param-error';
import { ServerError } from '../../errors/server-error';
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
    if (!('email' in httpRequest.body))
      return badRequest(new MissingParamError('email'));
    if (!('username' in httpRequest.body))
      return badRequest(new MissingParamError('username'));
    if (!('password' in httpRequest.body))
      return badRequest(new MissingParamError('password'));

    // Create an user in the database

    const eitherUser = await this.createUser.execute({
      email: httpRequest.body.email,
      password: httpRequest.body.password,
      username: httpRequest.body.username,
      profileImageURL: httpRequest.body.profileImageURL,
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

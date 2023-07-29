import { MissingParamError } from '../../errors/missing-param-error';
import { ServerError } from '../../errors/server-error';
import { CreateAccessTokenUC } from '../../use-cases/create-access-token';
import { CreateRefreshTokenUC } from '../../use-cases/create-refresh-token';
import { ValidateRefreshTokenUC } from '../../use-cases/validate-refresh-token';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class RefreshTokenController implements Adapter {
  constructor(
    private createAccessTokenUC: CreateAccessTokenUC,
    private createRefreshTokenUC: CreateRefreshTokenUC,
    private validateRefreshTokenUC: ValidateRefreshTokenUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    if (!('refreshToken' in httpRequest.body))
      return badRequest(new MissingParamError('refreshToken'));

    const eitherValidateRT = await this.validateRefreshTokenUC.execute(
      httpRequest.body.refreshToken,
    );

    if (eitherValidateRT.isLeft()) {
      if (eitherValidateRT.value.name === 'Server error')
        return serverError(eitherValidateRT.value);
      else return badRequest(eitherValidateRT.value);
    }

    const user = eitherValidateRT.value;

    const accessToken = this.createAccessTokenUC.execute(user);

    const eitherRefreshToken = await this.createRefreshTokenUC.execute(user);

    if (eitherRefreshToken.isLeft()) return serverError(new ServerError());

    const refreshToken = eitherRefreshToken.value;

    return ok({
      accessToken,
      refreshToken,
    });
  };
}

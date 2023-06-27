import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
import { UpdateUserUC } from '../../use-cases/update-user';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class UpdateMeController implements Adapter {
  constructor(private updateUserUC: UpdateUserUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!payload || !('userID' in payload))
      return serverError(new ServerError());

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

    const eitherUpdatedUser = await this.updateUserUC.execute(
      payload.userID,
      body,
    );

    if (eitherUpdatedUser.isLeft()) {
      if (eitherUpdatedUser.value.name === 'Server error')
        return serverError(eitherUpdatedUser.value);
      else return badRequest(eitherUpdatedUser.value);
    }

    const updatedUser = eitherUpdatedUser.value;

    return ok({ updatedUser: updatedUser.noConfidentialValue });
  };
}

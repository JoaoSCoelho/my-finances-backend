import { ServerError } from '../../errors/server-error';
import { UpdateUserUC } from '../../use-cases/update-user';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class UpdateMeController implements Adapter {
  constructor(private updateUserUC: UpdateUserUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!payload || !('userID' in payload))
      return serverError(new ServerError());

    const eitherUpdatedUser = await this.updateUserUC.execute(payload.userID, {
      email: httpRequest.body.email,
      profileImageURL: httpRequest.body.profileImageURL,
      username: httpRequest.body.username,
    });

    if (eitherUpdatedUser.isLeft()) {
      if (eitherUpdatedUser.value.name === 'Server error')
        return serverError(eitherUpdatedUser.value);
      else return badRequest(eitherUpdatedUser.value);
    }

    const updatedUser = eitherUpdatedUser.value;

    return ok({ updatedUser: updatedUser.noConfidentialValue });
  };
}

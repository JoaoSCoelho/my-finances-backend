import { ServerError } from '../../errors/server-error';
import { GetUserUC } from '../../use-cases/get-user';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class MeController implements Adapter {
  constructor(private getUserUC: GetUserUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const userID = payload.userID;

    const eitherUser = await this.getUserUC.execute(userID);

    if (eitherUser.isLeft()) {
      if (eitherUser.value.name === 'Server error')
        return serverError(eitherUser.value);
      return badRequest(eitherUser.value);
    }

    const user = eitherUser.value;

    return ok({
      user: user.noConfidentialValue,
    });
  };
}

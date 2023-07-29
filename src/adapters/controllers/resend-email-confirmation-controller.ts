import { ServerError } from '../../errors/server-error';
import { IAccessTokenPayload } from '../../external/ports/token-manager';
import { GetUserUC } from '../../use-cases/get-user';
import { SendEmailConfirmationUC } from '../../use-cases/send-email-confirmation';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class ResendEmailConfirmationController implements Adapter {
  constructor(
    private sendEmailConfirmationUC: SendEmailConfirmationUC,
    private getUserUC: GetUserUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const { userID } = payload as IAccessTokenPayload;

    const eitherUser = await this.getUserUC.execute(userID);

    if (eitherUser.isLeft()) {
      if (eitherUser.value.name === 'Server error')
        return serverError(eitherUser.value);
      else return badRequest(eitherUser.value);
    }

    const user = eitherUser.value;

    await this.sendEmailConfirmationUC.execute(user);

    return ok();
  };
}

import { ServerError } from '../../errors/server-error';
import { DeleteUserBankAccountUC } from '../../use-cases/delete-user-bank-account';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class DeleteUserBankAccountController implements Adapter {
  constructor(private deleteUserBankAccountUC: DeleteUserBankAccountUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherDeletedBankAccountObject =
      await this.deleteUserBankAccountUC.execute(
        payload.userID,
        httpRequest.params.id,
      );

    if (eitherDeletedBankAccountObject.isLeft()) {
      if (eitherDeletedBankAccountObject.value.name === 'Server error')
        return serverError(eitherDeletedBankAccountObject.value);
      return badRequest(eitherDeletedBankAccountObject.value);
    }

    const deletedBankAccountObject = eitherDeletedBankAccountObject.value;

    return ok({
      bankAccount: deletedBankAccountObject,
    });
  };
}

import { ServerError } from '../../errors/server-error';
import { CreateBankAccountUC } from '../../use-cases/create-bank-account';
import { badRequest, created, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateBankAccountController implements Adapter {
  constructor(private createBankAccountUC: CreateBankAccountUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherBankAccount = await this.createBankAccountUC.execute({
      name: httpRequest.body.name,
      initialAmount: httpRequest.body.initialAmount,
      userId: payload.userID,
      imageURL: httpRequest.body.imageURL,
    });

    if (eitherBankAccount.isLeft()) return badRequest(eitherBankAccount.value);

    const bankAccount = eitherBankAccount.value;

    return created({
      bankAccount: bankAccount.value,
    });
  };
}

import { CreateBankAccountUC } from '../../use-cases/create-bank-account';
import { badRequest, created } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateBankAccountController implements Adapter {
  constructor(private createBankAccountUC: CreateBankAccountUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const eitherBankAccount = await this.createBankAccountUC.execute({
      name: httpRequest.body.name,
      amount: httpRequest.body.amount,
      userId: httpRequest.nextData?.auth.userID,
      imageURL: httpRequest.body.imageURL,
    });

    if (eitherBankAccount.isLeft()) return badRequest(eitherBankAccount.value);

    const bankAccount = eitherBankAccount.value;

    return created({
      bankAccount: bankAccount.value,
    });
  };
}

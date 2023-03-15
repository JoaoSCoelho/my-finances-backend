import { GetUserBankAccountsUC } from '../../use-cases/get-user-bank-accounts';
import { ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class MyBankAccountsController implements Adapter {
  constructor(private getUserBankAccountsUC: GetUserBankAccountsUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const eitherBankAccounts = await this.getUserBankAccountsUC.execute(
      httpRequest.nextData!.auth.userID,
    );

    if (eitherBankAccounts.isLeft())
      return serverError(eitherBankAccounts.value);

    const bankAccounts = eitherBankAccounts.value;

    return ok({
      bankAccounts: bankAccounts.map((bankAccount) => bankAccount.value),
    });
  };
}

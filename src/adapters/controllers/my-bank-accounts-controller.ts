import { ServerError } from '../../errors/server-error';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { GetUserBankAccountsUC } from '../../use-cases/get-user-bank-accounts';
import { ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class MyBankAccountsController implements Adapter {
  constructor(
    private getUserBankAccountsUC: GetUserBankAccountsUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherBankAccounts = await this.getUserBankAccountsUC.execute(
      payload.userID,
    );

    if (eitherBankAccounts.isLeft())
      return serverError(eitherBankAccounts.value);

    const bankAccounts = eitherBankAccounts.value;

    const bankAccountsObjectsWithTotalAmount = await Promise.all(
      bankAccounts.map(async (bankAccount) => ({
        ...bankAccount.value,
        totalAmount: (
          await this.calculateBankAccountAmountUC.execute(bankAccount.id.value)
        ).value as number,
      })),
    );

    return ok({
      bankAccounts: bankAccountsObjectsWithTotalAmount,
    });
  };
}

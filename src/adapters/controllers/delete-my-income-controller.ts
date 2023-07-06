import { ServerError } from '../../errors/server-error';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { DeleteUserIncomeUC } from '../../use-cases/delete-user-income';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class DeleteMyIncomeController implements Adapter {
  constructor(
    private deleteUserIncomeUC: DeleteUserIncomeUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherIncomeObject = await this.deleteUserIncomeUC.execute(
      payload.userID,
      httpRequest.params.id,
    );

    if (eitherIncomeObject.isLeft())
      return badRequest(eitherIncomeObject.value);

    const incomeObject = eitherIncomeObject.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        incomeObject.bankAccountId,
      );

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return ok({
      newBankAccountAmount: bankAccountAmount,
    });
  };
}

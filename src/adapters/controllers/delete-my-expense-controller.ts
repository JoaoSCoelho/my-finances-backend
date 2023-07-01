import { ServerError } from '../../errors/server-error';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { DeleteUserExpenseUC } from '../../use-cases/delete-user-expense';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class DeleteMyExpenseController implements Adapter {
  constructor(
    private deleteUserExpenseUC: DeleteUserExpenseUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherExpenseObject = await this.deleteUserExpenseUC.execute(
      payload.userID,
      httpRequest.params.id,
    );

    if (eitherExpenseObject.isLeft())
      return badRequest(eitherExpenseObject.value);

    const expenseObject = eitherExpenseObject.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        expenseObject.bankAccountId,
      );

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return ok({
      newBankAccountAmount: bankAccountAmount,
    });
  };
}

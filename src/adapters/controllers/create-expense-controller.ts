import { MissingParamError } from '../../errors/missing-param-error';
import { ServerError } from '../../errors/server-error';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { CreateExpenseUC } from '../../use-cases/create-expense';
import { badRequest, created, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateExpenseController implements Adapter {
  constructor(
    private createExpenseUC: CreateExpenseUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    if (!('title' in httpRequest.body))
      return badRequest(new MissingParamError('title'));
    if (!('spent' in httpRequest.body))
      return badRequest(new MissingParamError('spent'));
    if (!('bankAccountId' in httpRequest.body))
      return badRequest(new MissingParamError('bankAccountId'));

    const eitherExpense = await this.createExpenseUC.execute(
      {
        bankAccountId: httpRequest.body.bankAccountId,
        description: httpRequest.body.description,
        spent: httpRequest.body.spent,
        title: httpRequest.body.title,
      },
      payload.userID,
    );

    if (eitherExpense.isLeft()) return badRequest(eitherExpense.value);

    const expense = eitherExpense.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        httpRequest.body.bankAccountId,
      );

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return created({
      expense: expense.value,
      newBankAccountAmount: bankAccountAmount,
    });
  };
}

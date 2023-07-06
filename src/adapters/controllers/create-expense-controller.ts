import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
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

    const eitherBody = AnyObject.create(httpRequest.body);

    if (eitherBody.isLeft()) {
      const {
        value: { reason, expected },
      } = eitherBody;

      return badRequest(
        new InvalidParamError('body', httpRequest.body, reason, expected),
      );
    }

    const { value: body } = eitherBody.value;

    const eitherExpense = await this.createExpenseUC.execute(
      {
        bankAccountId: body.bankAccountId,
        description: body.description,
        spent: body.spent,
        title: body.title,
      },
      payload.userID,
    );

    if (eitherExpense.isLeft()) return badRequest(eitherExpense.value);

    const expense = eitherExpense.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(body.bankAccountId);

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return created({
      expense: expense.value,
      newBankAccountAmount: bankAccountAmount,
    });
  };
}

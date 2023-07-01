import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { UpdateUserExpenseUC } from '../../use-cases/update-user-expense';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class UpdateMyExpenseController implements Adapter {
  constructor(
    private updateUserExpenseUC: UpdateUserExpenseUC,
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

    const eitherUpdateExpense = await this.updateUserExpenseUC.execute(
      payload.userID,
      httpRequest.params.id,
      {
        description: body.description,
        title: body.title,
        spent: body.spent,
        bankAccountId: body.bankAccountId,
      },
    );

    if (eitherUpdateExpense.isLeft()) {
      if (eitherUpdateExpense.value.name === 'Server error')
        return serverError(eitherUpdateExpense.value);
      else return badRequest(eitherUpdateExpense.value);
    }

    const updatedExpense = eitherUpdateExpense.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        updatedExpense.bankAccountId.value,
      );

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return ok({
      updatedExpense: updatedExpense.value,
      newBankAccountAmount: bankAccountAmount,
    });
  };
}

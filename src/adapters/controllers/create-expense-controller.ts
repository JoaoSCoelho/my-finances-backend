import { InvalidParamError } from '../../errors/invalid-param-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateExpenseUC } from '../../use-cases/create-expense';
import { badRequest, created } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateExpenseController implements Adapter {
  constructor(private createExpenseUC: CreateExpenseUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
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

    const eitherExpense = await this.createExpenseUC.execute({
      bankAccountId: httpRequest.params.id,
      description: body.description,
      spent: body.spent,
    });

    if (eitherExpense.isLeft()) return badRequest(eitherExpense.value);

    const expense = eitherExpense.value;

    return created({
      expense: expense.value,
    });
  };
}

import { ServerError } from '../../errors/server-error';
import { GetUserExpensesUC } from '../../use-cases/get-user-expenses';
import { ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class GetMyExpensesController implements Adapter {
  constructor(private getUserExpensesUC: GetUserExpensesUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherExpenses = await this.getUserExpensesUC.execute(payload.userID);

    if (eitherExpenses.isLeft()) return serverError(eitherExpenses.value);

    const expenses = eitherExpenses.value;

    return ok({
      expenses: expenses.map((expense) => expense.value),
    });
  };
}

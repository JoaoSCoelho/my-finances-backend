import { ServerError } from '../../errors/server-error';
import { GetUserIncomesUC } from '../../use-cases/get-user-incomes';
import { ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class GetMyIncomesController implements Adapter {
  constructor(private getUserIncomesUC: GetUserIncomesUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherIncomes = await this.getUserIncomesUC.execute(payload.userID);

    if (eitherIncomes.isLeft()) return serverError(eitherIncomes.value);

    const incomes = eitherIncomes.value;

    return ok({
      incomes: incomes.map((income) => income.value),
    });
  };
}

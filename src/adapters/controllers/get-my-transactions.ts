import { ServerError } from '../../errors/server-error';
import { GetUserExpensesUC } from '../../use-cases/get-user-expenses';
import { GetUserIncomesUC } from '../../use-cases/get-user-incomes';
import { GetUserTransfersUC } from '../../use-cases/get-user-transfers';
import { ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class GetMyTransactionsController implements Adapter {
  constructor(
    private getUserExpensesUC: GetUserExpensesUC,
    private getUserIncomesUC: GetUserIncomesUC,
    private getUserTransfersUC: GetUserTransfersUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    // Pegar id do usuario
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    // Buscar expenses, incomes e transfers
    const eitherExpenses = await this.getUserExpensesUC.execute(payload.userID);

    if (eitherExpenses.isLeft()) return serverError(eitherExpenses.value);

    // Buscar incomes
    const eitherIncomes = await this.getUserIncomesUC.execute(payload.userID);

    if (eitherIncomes.isLeft()) return serverError(eitherIncomes.value);

    // Buscar transfers
    const eitherTransfers = await this.getUserTransfersUC.execute(
      payload.userID,
    );

    if (eitherTransfers.isLeft()) return serverError(eitherTransfers.value);

    const expenses = eitherExpenses.value;
    const incomes = eitherIncomes.value;
    const transfers = eitherTransfers.value;

    const transactionsObjects = [
      ...expenses.map((expense) => ({ ...expense.value, type: 'expense' })),
      ...incomes.map((income) => ({ ...income.value, type: 'income' })),
      ...transfers.map((transfer) => ({ ...transfer.value, type: 'transfer' })),
    ];

    return ok({
      transactions: transactionsObjects,
    });
  };
}

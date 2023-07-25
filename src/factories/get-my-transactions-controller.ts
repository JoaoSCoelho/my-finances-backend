import { GetMyTransactionsController } from '../adapters/controllers/get-my-transactions';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { GetUserExpensesUC } from '../use-cases/get-user-expenses';
import { GetUserIncomesUC } from '../use-cases/get-user-incomes';
import { GetUserTransfersUC } from '../use-cases/get-user-transfers';

export function makeGetMyTransactionsController() {
  const expensesRepository = new MongoExpenses();
  const bankAccountsRepository = new MongoBankAccounts();
  const getUserExpensesUC = new GetUserExpensesUC(
    expensesRepository,
    bankAccountsRepository,
  );
  const incomesRepository = new MongoIncomes();
  const transfersRepository = new MongoTransfers();
  const getUserIncomesUC = new GetUserIncomesUC(
    incomesRepository,
    bankAccountsRepository,
  );
  const getUserTransfersUC = new GetUserTransfersUC(
    transfersRepository,
    bankAccountsRepository,
  );
  const getMyTransactionsController = new GetMyTransactionsController(
    getUserExpensesUC,
    getUserIncomesUC,
    getUserTransfersUC,
  );

  return getMyTransactionsController;
}

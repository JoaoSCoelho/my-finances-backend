import { GetMyExpensesController } from '../adapters/controllers/get-my-expenses-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { GetUserExpensesUC } from '../use-cases/get-user-expenses';

export function makeGetMyExpensesController() {
  const expensesRepository = new MongoExpenses();
  const bankAccountsRepository = new MongoBankAccounts();
  const getUserExpensesUC = new GetUserExpensesUC(
    expensesRepository,
    bankAccountsRepository,
  );
  const getMyExpensesController = new GetMyExpensesController(
    getUserExpensesUC,
  );

  return getMyExpensesController;
}

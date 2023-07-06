import { GetMyIncomesController } from '../adapters/controllers/get-my-incomes-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { GetUserIncomesUC } from '../use-cases/get-user-incomes';

export function makeGetMyIncomesController() {
  const incomesRepository = new MongoIncomes();
  const bankAccountsRepository = new MongoBankAccounts();
  const getUserIncomesUC = new GetUserIncomesUC(
    incomesRepository,
    bankAccountsRepository,
  );
  const getMyIncomesController = new GetMyIncomesController(getUserIncomesUC);

  return getMyIncomesController;
}

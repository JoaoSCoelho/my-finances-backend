import { MyBankAccountsController } from '../adapters/controllers/my-bank-accounts-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { GetUserBankAccountsUC } from '../use-cases/get-user-bank-accounts';

export function makeMyBankAccountsController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const getUserBankAccountsUC = new GetUserBankAccountsUC(
    bankAccountsRepository,
  );
  const incomesRepository = new MongoIncomes();
  const expensesRepository = new MongoExpenses();
  const transfersRepository = new MongoTransfers();
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const myBankAccountsController = new MyBankAccountsController(
    getUserBankAccountsUC,
    calculateBankAccountAmountUC,
  );

  return myBankAccountsController;
}

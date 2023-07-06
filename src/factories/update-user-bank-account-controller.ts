import { UpdateUserBankAccountController } from '../adapters/controllers/update-user-bank-account-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { UpdateUserBankAccountUC } from '../use-cases/update-user-bank-account';

export function makeUpdateUserBankAccountController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const updateUserBankAccountUC = new UpdateUserBankAccountUC(
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
  const updateUserBankAccountController = new UpdateUserBankAccountController(
    updateUserBankAccountUC,
    calculateBankAccountAmountUC,
  );

  return updateUserBankAccountController;
}

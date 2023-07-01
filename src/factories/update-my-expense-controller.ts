import { UpdateMyExpenseController } from '../adapters/controllers/update-my-expense-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { UpdateUserExpenseUC } from '../use-cases/update-user-expense';

export function makeUpdateMyExpenseController() {
  const expensesRepository = new MongoExpenses();
  const bankAccountsRepository = new MongoBankAccounts();
  const updateUserExpenseUC = new UpdateUserExpenseUC(
    expensesRepository,
    bankAccountsRepository,
  );
  const incomesRepository = new MongoIncomes();
  const transfersRepository = new MongoTransfers();
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const updateMyExpenseController = new UpdateMyExpenseController(
    updateUserExpenseUC,
    calculateBankAccountAmountUC,
  );

  return updateMyExpenseController;
}

import { DeleteMyExpenseController } from '../adapters/controllers/delete-my-expense-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { DeleteUserExpenseUC } from '../use-cases/delete-user-expense';

export function makeDeleteMyExpenseController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const expensesRepository = new MongoExpenses();
  const incomesRepository = new MongoIncomes();
  const transfersRepository = new MongoTransfers();
  const deleteUserExpenseUC = new DeleteUserExpenseUC(
    expensesRepository,
    bankAccountsRepository,
  );
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const deleteMyExpenseController = new DeleteMyExpenseController(
    deleteUserExpenseUC,
    calculateBankAccountAmountUC,
  );

  return deleteMyExpenseController;
}

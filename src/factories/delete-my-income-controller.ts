import { DeleteMyIncomeController } from '../adapters/controllers/delete-my-income-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { DeleteUserIncomeUC } from '../use-cases/delete-user-income';

export function makeDeleteMyIncomeController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const expensesRepository = new MongoExpenses();
  const incomesRepository = new MongoIncomes();
  const transfersRepository = new MongoTransfers();
  const deleteUserIncomeUC = new DeleteUserIncomeUC(
    incomesRepository,
    bankAccountsRepository,
  );
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const deleteMyIncomeController = new DeleteMyIncomeController(
    deleteUserIncomeUC,
    calculateBankAccountAmountUC,
  );

  return deleteMyIncomeController;
}

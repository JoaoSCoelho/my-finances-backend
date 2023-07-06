import { UpdateMyIncomeController } from '../adapters/controllers/update-my-income-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { UpdateUserIncomeUC } from '../use-cases/update-user-income';

export function makeUpdateMyIncomeController() {
  const expensesRepository = new MongoExpenses();
  const bankAccountsRepository = new MongoBankAccounts();
  const incomesRepository = new MongoIncomes();
  const updateUserIncomeUC = new UpdateUserIncomeUC(
    incomesRepository,
    bankAccountsRepository,
  );
  const transfersRepository = new MongoTransfers();
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const updateMyIncomeController = new UpdateMyIncomeController(
    updateUserIncomeUC,
    calculateBankAccountAmountUC,
  );

  return updateMyIncomeController;
}

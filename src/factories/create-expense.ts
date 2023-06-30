import { CreateExpenseController } from '../adapters/controllers/create-expense-controller';
import { Moment } from '../external/generator-id-providers/moment';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { CreateExpenseUC } from '../use-cases/create-expense';

export function makeCreateExpenseController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const expensesRepository = new MongoExpenses();
  const generatorIdProdiver = new Moment();
  const createExpenseUC = new CreateExpenseUC(
    bankAccountsRepository,
    expensesRepository,
    generatorIdProdiver,
  );
  const incomesRepository = new MongoIncomes();
  const expesesRepository = new MongoExpenses();
  const transfersRepository = new MongoTransfers();
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expesesRepository,
    transfersRepository,
  );
  const createExpenseController = new CreateExpenseController(
    createExpenseUC,
    calculateBankAccountAmountUC,
  );

  return createExpenseController;
}

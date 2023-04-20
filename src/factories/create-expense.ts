import { CreateExpenseController } from '../adapters/controllers/create-expense-controller';
import { Moment } from '../external/generator-id-providers/moment';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
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
  const createExpenseController = new CreateExpenseController(createExpenseUC);

  return createExpenseController;
}

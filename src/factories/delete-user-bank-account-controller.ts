import { DeleteUserBankAccountController } from '../adapters/controllers/delete-user-bank-account-controller';
import { Moment } from '../external/generator-id-providers/moment';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CreateExpenseUC } from '../use-cases/create-expense';
import { CreateIncomeUC } from '../use-cases/create-income';
import { DeleteUserBankAccountUC } from '../use-cases/delete-user-bank-account';

export function makeDeleteUserBankAccountController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const incomesRepository = new MongoIncomes();
  const expensesRepository = new MongoExpenses();
  const transfersRepository = new MongoTransfers();
  const generatorIdProvider = new Moment();
  const createIncomeUC = new CreateIncomeUC(
    bankAccountsRepository,
    incomesRepository,
    generatorIdProvider,
  );
  const createExpenseUC = new CreateExpenseUC(
    bankAccountsRepository,
    expensesRepository,
    generatorIdProvider,
  );
  const deleteUserBankAccountUC = new DeleteUserBankAccountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
    createIncomeUC,
    createExpenseUC,
  );
  const deleteUserBankAccountController = new DeleteUserBankAccountController(
    deleteUserBankAccountUC,
  );

  return deleteUserBankAccountController;
}

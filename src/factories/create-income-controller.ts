import { CreateIncomeController } from '../adapters/controllers/create-income-controller';
import { Moment } from '../external/generator-id-providers/moment';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { CreateIncomeUC } from '../use-cases/create-income';

export function makeCreateIncomeController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const expensesRepository = new MongoExpenses();
  const generatorIdProdiver = new Moment();
  const incomesRepository = new MongoIncomes();

  const createIncomeUC = new CreateIncomeUC(
    bankAccountsRepository,
    incomesRepository,
    generatorIdProdiver,
  );
  const transfersRepository = new MongoTransfers();
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const createIncomeController = new CreateIncomeController(
    createIncomeUC,
    calculateBankAccountAmountUC,
  );

  return createIncomeController;
}

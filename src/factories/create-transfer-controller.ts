import { CreateTransferController } from '../adapters/controllers/create-transfer-controller';
import { Moment } from '../external/generator-id-providers/moment';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { CreateTransferUC } from '../use-cases/create-transfer';

export function makeCreateTransferController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const transfersRepository = new MongoTransfers();
  const generatorIdProvider = new Moment();
  const createTransferUC = new CreateTransferUC(
    bankAccountsRepository,
    transfersRepository,
    generatorIdProvider,
  );
  const incomesRepository = new MongoIncomes();
  const expensesRepository = new MongoExpenses();
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const createTransferController = new CreateTransferController(
    createTransferUC,
    calculateBankAccountAmountUC,
  );

  return createTransferController;
}

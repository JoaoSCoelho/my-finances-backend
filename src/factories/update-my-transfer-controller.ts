import { UpdateMyTransferController } from '../adapters/controllers/update-my-transfer-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { UpdateUserTransferUC } from '../use-cases/update-user-transfer';

export function makeUpdateMyTransferController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const incomesRepository = new MongoIncomes();
  const expensesRepository = new MongoExpenses();
  const transfersRepository = new MongoTransfers();
  const updateUserTransferUC = new UpdateUserTransferUC(
    transfersRepository,
    bankAccountsRepository,
  );
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const updateMyTransferController = new UpdateMyTransferController(
    updateUserTransferUC,
    calculateBankAccountAmountUC,
  );

  return updateMyTransferController;
}

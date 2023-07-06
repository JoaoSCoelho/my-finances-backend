import { DeleteMyTransferController } from '../adapters/controllers/delete-my-transfer-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoExpenses } from '../external/repositories/expenses/mongodb';
import { MongoIncomes } from '../external/repositories/incomes/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { CalculateBankAccountAmountUC } from '../use-cases/calculate-bank-account-amount';
import { DeleteUserTransferUC } from '../use-cases/delete-user-transfer';

export function makeDeleteMyTransferController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const incomesRepository = new MongoIncomes();
  const expensesRepository = new MongoExpenses();
  const transfersRepository = new MongoTransfers();
  const deleteUserTransferUC = new DeleteUserTransferUC(
    transfersRepository,
    bankAccountsRepository,
  );
  const calculateBankAccountAmountUC = new CalculateBankAccountAmountUC(
    bankAccountsRepository,
    incomesRepository,
    expensesRepository,
    transfersRepository,
  );
  const deleteMyTransferController = new DeleteMyTransferController(
    deleteUserTransferUC,
    calculateBankAccountAmountUC,
  );

  return deleteMyTransferController;
}

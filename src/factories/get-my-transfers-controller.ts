import { GetMyTransfersController } from '../adapters/controllers/get-my-transfers-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoTransfers } from '../external/repositories/transfers/mongodb';
import { GetUserTransfersUC } from '../use-cases/get-user-transfers';

export function makeGetMyTransfersController() {
  const transfersRepository = new MongoTransfers();
  const bankAccountsRepository = new MongoBankAccounts();
  const getUserTransfersUC = new GetUserTransfersUC(
    transfersRepository,
    bankAccountsRepository,
  );
  const getMyTransfersController = new GetMyTransfersController(
    getUserTransfersUC,
  );

  return getMyTransfersController;
}

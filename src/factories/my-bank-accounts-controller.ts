import { MyBankAccountsController } from '../adapters/controllers/my-bank-accounts-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { GetUserBankAccountsUC } from '../use-cases/get-user-bank-accounts';

export function makeMyBankAccountsController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const getUserBankAccountsUC = new GetUserBankAccountsUC(
    bankAccountsRepository,
  );
  const myBankAccountsController = new MyBankAccountsController(
    getUserBankAccountsUC,
  );

  return myBankAccountsController;
}

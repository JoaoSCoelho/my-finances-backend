import { UpdateUserBankAccountController } from '../adapters/controllers/update-user-bank-account-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { UpdateUserBankAccountUC } from '../use-cases/update-user-bank-account';

export function makeUpdateUserBankAccountController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const updateUserBankAccountUC = new UpdateUserBankAccountUC(
    bankAccountsRepository,
  );
  const updateUserBankAccountController = new UpdateUserBankAccountController(
    updateUserBankAccountUC,
  );

  return updateUserBankAccountController;
}

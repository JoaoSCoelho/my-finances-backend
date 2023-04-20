import { DeleteUserBankAccountController } from '../adapters/controllers/delete-user-bank-account-controller';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { DeleteUserBankAccountUC } from '../use-cases/delete-user-bank-account';

export function makeDeleteUserBankAccountController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const deleteUserBankAccountUC = new DeleteUserBankAccountUC(
    bankAccountsRepository,
  );
  const deleteUserBankAccountController = new DeleteUserBankAccountController(
    deleteUserBankAccountUC,
  );

  return deleteUserBankAccountController;
}

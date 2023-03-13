import { CreateBankAccountController } from '../adapters/controllers/create-bank-account-controller';
import { Moment } from '../external/generator-id-providers/moment';
import { MongoBankAccounts } from '../external/repositories/bank-accounts/mongodb';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { CreateBankAccountUC } from '../use-cases/create-bank-account';

export function makeCreateBankAccountController() {
  const bankAccountsRepository = new MongoBankAccounts();
  const usersRepository = new MongoUsers();
  const generatorIDProvider = new Moment();
  const createBankAccountUC = new CreateBankAccountUC(
    bankAccountsRepository,
    usersRepository,
    generatorIDProvider,
  );
  const createBankAccountController = new CreateBankAccountController(
    createBankAccountUC,
  );

  return createBankAccountController;
}

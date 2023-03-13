import {
  BankAccountsRepository,
  SetMethod,
} from '../../ports/bank-accounts-repository';
import { BankAccountModel } from './model';

export class MongoBankAccounts implements BankAccountsRepository {
  set: SetMethod = async (bankAccount) => {
    await BankAccountModel.create(bankAccount);

    return bankAccount;
  };
}

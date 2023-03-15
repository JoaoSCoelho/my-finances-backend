import { BankAccount } from '../../../entities/bank-account';
import { ServerError } from '../../../errors/server-error';
import {
  BankAccountsRepository,
  FilterEqualMethod,
  SetMethod,
} from '../../ports/bank-accounts-repository';
import { BankAccountModel } from './model';

export class MongoBankAccounts implements BankAccountsRepository {
  set: SetMethod = async (bankAccount) => {
    await BankAccountModel.create(bankAccount);

    return bankAccount;
  };

  filterEqual: FilterEqualMethod = async (key, value) => {
    const dbBankAccounts = await BankAccountModel.find({ [key]: value });

    return dbBankAccounts.map((dbBankAccount) => {
      const eitherBankAccount = BankAccount.create(dbBankAccount);

      if (eitherBankAccount.isLeft()) throw new ServerError('internal');

      const bankAccount = eitherBankAccount.value;

      return bankAccount.value;
    });
  };
}

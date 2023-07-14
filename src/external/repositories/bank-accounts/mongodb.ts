import { BankAccount } from '../../../entities/bank-account';
import { ServerError } from '../../../errors/server-error';
import { left, right } from '../../../shared/either';
import {
  BankAccountsRepository,
  DeleteMethod,
  DeletePropsMethod,
  ExistsMethod,
  ExistsWithThisIDMethod,
  FilterEqualMethod,
  FilterWithThisPropsMethod,
  FindWithThisPropsMethod,
  SetMethod,
  UpdateMethod,
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

  filterWithThisProps: FilterWithThisPropsMethod = async (filter) => {
    const dbBankAccounts = await BankAccountModel.find(filter);

    return dbBankAccounts.map((dbBankAccount) => {
      const eitherBankAccount = BankAccount.create(dbBankAccount);

      if (eitherBankAccount.isLeft()) throw new ServerError('internal');

      const bankAccount = eitherBankAccount.value;

      return bankAccount.value;
    });
  };

  findWithThisProps: FindWithThisPropsMethod = async (filter) => {
    const dbBankAccountObject = await BankAccountModel.findOne(filter);

    if (!dbBankAccountObject) return left(null);

    const eitherBankAccount = BankAccount.create(dbBankAccountObject);

    if (eitherBankAccount.isLeft()) throw new ServerError('internal');

    const bankAccount = eitherBankAccount.value;

    return right(bankAccount.value);
  };

  update: UpdateMethod = async (id, updateObject) => {
    const dbBankAccount = await BankAccountModel.findOneAndUpdate(
      { id },
      updateObject,
      { new: true },
    );

    if (!dbBankAccount) return left(null);

    const eitherBankAccount = BankAccount.create(dbBankAccount);

    if (eitherBankAccount.isLeft()) throw new ServerError();

    const bankAccount = eitherBankAccount.value;

    return right(bankAccount.value);
  };

  delete: DeleteMethod = async (id) => {
    await BankAccountModel.findOneAndDelete({ id: id });

    return;
  };

  deleteProps: DeletePropsMethod = async (id, propsNames) => {
    const dbBankAccount = await BankAccountModel.findOneAndUpdate(
      { id },
      {
        $unset: propsNames.reduce(
          (prev, curr) => ({ ...prev, [curr]: '' }),
          {},
        ),
      },
      { new: true },
    );

    if (!dbBankAccount) return left(null);

    const eitherBankAccount = BankAccount.create(dbBankAccount);

    if (eitherBankAccount.isLeft()) throw new ServerError();

    const bankAccount = eitherBankAccount.value;

    return right(bankAccount.value);
  };

  existsWithThisID: ExistsWithThisIDMethod = async (bankAccountId) => {
    const documentWithThisID = await BankAccountModel.exists({
      id: bankAccountId,
    });

    if (!documentWithThisID) return false;

    return true;
  };

  exists: ExistsMethod = async (filter) => {
    const documentExists = await BankAccountModel.exists(filter);

    if (!documentExists) return false;

    return true;
  };
}

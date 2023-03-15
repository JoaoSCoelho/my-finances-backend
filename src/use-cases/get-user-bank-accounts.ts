import { BankAccount } from '../entities/bank-account';
import { ServerError } from '../errors/server-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { left, right } from '../shared/either';
import { ExecuteMethod } from './ports/get-user-bank-accounts';

export class GetUserBankAccountsUC {
  constructor(private bankAccountsRepository: BankAccountsRepository) {}

  execute: ExecuteMethod = async (userID: string) => {
    const bankAccountsObjects = await this.bankAccountsRepository.filterEqual(
      'userId',
      userID,
    );

    const eitherBankAccounts = bankAccountsObjects.map((bankAccountObject) =>
      BankAccount.create(bankAccountObject),
    );

    if (
      eitherBankAccounts.find((eitherBankAccount) => eitherBankAccount.isLeft())
    )
      return left(new ServerError('internal'));

    const bankAccounts = eitherBankAccounts.map(
      (eitherBankAccount) => eitherBankAccount.value as BankAccount,
    );

    return right(bankAccounts);
  };
}

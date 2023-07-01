import { BankAccount } from '../entities/bank-account';
import { ServerError } from '../errors/server-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { Either, left, right } from '../shared/either';

export class GetUserBankAccountsUC {
  constructor(private bankAccountsRepository: BankAccountsRepository) {}

  async execute(userID: string): Promise<Either<ServerError, BankAccount[]>> {
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
  }
}

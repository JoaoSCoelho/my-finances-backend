import { BankAccount } from '../entities/bank-account';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { Either, left, right } from '../shared/either';

export class GetUserBankAccountUC {
  constructor(private bankAccountsRepository: BankAccountsRepository) {}

  async execute(
    userID: string,
    bankAccountId: string,
  ): Promise<
    Either<ServerError | ThereIsNoEntityWithThisPropError, BankAccount>
  > {
    const eitherBankAccountObject =
      await this.bankAccountsRepository.findWithThisProps({
        userId: userID,
        id: bankAccountId,
      });

    if (eitherBankAccountObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError(
          'bankAccount',
          'id',
          bankAccountId,
        ),
      );

    const bankAccountObject = eitherBankAccountObject.value;

    const eitherBankAccount = BankAccount.create(bankAccountObject);

    if (eitherBankAccount.isLeft()) return left(new ServerError());

    const bankAccount = eitherBankAccount.value;

    return right(bankAccount);
  }
}

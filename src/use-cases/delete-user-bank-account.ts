import { IBankAccountObject } from '../entities/bank-account';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { Either, left, right } from '../shared/either';

export class DeleteUserBankAccountUC {
  constructor(private bankAccountsRepository: BankAccountsRepository) {}

  async execute(
    userId: string,
    id: string,
  ): Promise<
    Either<ThereIsNoEntityWithThisPropError | ServerError, IBankAccountObject>
  > {
    const findedBankAccounts =
      await this.bankAccountsRepository.filterWithThisProps({ userId, id });

    if (findedBankAccounts.length > 1) return left(new ServerError());

    if (findedBankAccounts.length < 1)
      return left(
        new ThereIsNoEntityWithThisPropError('bankAccount', 'id', id),
      );

    await this.bankAccountsRepository.delete(id);

    return right(findedBankAccounts[0]);
  }
}

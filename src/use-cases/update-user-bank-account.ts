import { BankAccount, IBankAccountObject } from '../entities/bank-account';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { Amount } from '../object-values/amout';
import { BankAccountName } from '../object-values/bank-account-name';
import { URL } from '../object-values/url';
import { Either, left, right } from '../shared/either';

export class UpdateUserBankAccountUC {
  constructor(private bankAccountsRepository: BankAccountsRepository) {}

  async execute(
    id: string,
    userId: string,
    data: Partial<
      Pick<
        Record<keyof IBankAccountObject, any>,
        'initialAmount' | 'imageURL' | 'name'
      >
    >,
  ): Promise<
    Either<
      InvalidParamError | ServerError | ThereIsNoEntityWithThisPropError,
      BankAccount
    >
  > {
    const eitherName = BankAccountName.create(data.name);

    if (data.name !== undefined && eitherName.isLeft())
      return left(eitherName.value);

    const eitherInitialAmount = Amount.create(data.initialAmount);

    if (data.initialAmount !== undefined && eitherInitialAmount.isLeft())
      return left(
        new InvalidParamError(
          'initialAmount',
          data.initialAmount,
          eitherInitialAmount.value.reason,
          eitherInitialAmount.value.expected,
        ),
      );

    const eitherImageURL = URL.create(data.imageURL);

    if (data.imageURL != undefined && eitherImageURL.isLeft())
      return left(
        new InvalidParamError(
          'imageURL',
          data.imageURL,
          eitherImageURL.value.reason,
          eitherImageURL.value.expected,
        ),
      );

    const findedBankAccounts =
      await this.bankAccountsRepository.filterWithThisProps({
        id,
        userId,
      });

    if (findedBankAccounts.length > 1) return left(new ServerError());

    if (findedBankAccounts.length < 1)
      return left(
        new ThereIsNoEntityWithThisPropError('bankAccount', 'id', id),
      );

    const eitherUpdatedBankAccountObject =
      await this.bankAccountsRepository.update(id, {
        name: data.name,
        imageURL: data.imageURL == undefined ? undefined : data.imageURL,
        initialAmount: data.initialAmount,
      });

    if (eitherUpdatedBankAccountObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('bankAccount', 'id', id),
      );

    let updatedBankAccountObject = eitherUpdatedBankAccountObject.value;

    if (data.imageURL === null) {
      const eitherRemovedPropBankAccountObject =
        await this.bankAccountsRepository.deleteProps(id, ['imageURL']);

      if (eitherRemovedPropBankAccountObject.isLeft())
        return left(
          new ThereIsNoEntityWithThisPropError('bankAccount', 'id', id),
        );

      updatedBankAccountObject = eitherRemovedPropBankAccountObject.value;
    }

    const eitherBankAccount = BankAccount.create(updatedBankAccountObject);

    if (eitherBankAccount.isLeft()) return left(new ServerError());

    const bankAccount = eitherBankAccount.value;

    return right(bankAccount);
  }
}

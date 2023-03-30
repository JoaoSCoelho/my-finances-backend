import { BankAccount } from '../entities/bank-account';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { Amount } from '../object-values/amout';
import { BankAccountName } from '../object-values/bank-account-name';
import { URL } from '../object-values/url';
import { Either, left, right } from '../shared/either';
import { ExecuteMethod } from './ports/update-user-bank-account';

export class UpdateUserBankAccountUC {
  constructor(private bankAccountsRepository: BankAccountsRepository) {}

  execute: ExecuteMethod = async (id, userId, data) => {
    const eitherName = data.name
      ? BankAccountName.create(data.name)
      : undefined;

    if (eitherName?.isLeft()) return left(eitherName.value);

    const name = eitherName?.value as BankAccountName | undefined;

    const eitherAmount = data.name ? Amount.create(data.amount) : undefined;

    if (eitherAmount?.isLeft()) return left(eitherAmount.value);

    const amount = eitherAmount?.value as Amount | undefined;

    const eitherImageURL = (
      data.imageURL === undefined
        ? undefined
        : data.imageURL === ''
        ? right({ value: '' })
        : URL.create(data.imageURL)
    ) as Either<InvalidParamError, URL> | undefined;

    if (eitherImageURL?.isLeft())
      return left(
        new InvalidParamError(
          'imageURL',
          data.imageURL,
          eitherImageURL.value.reason,
          eitherImageURL.value.expected,
        ),
      );

    const imageURL = eitherImageURL?.value as URL | undefined;

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
        name: name?.value,
        imageURL: imageURL?.value,
        amount: amount?.value,
      });

    if (eitherUpdatedBankAccountObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('bankAccount', 'id', id),
      );

    const updatedBankAccountObject = eitherUpdatedBankAccountObject.value;

    const eitherBankAccount = BankAccount.create(updatedBankAccountObject);

    if (eitherBankAccount.isLeft()) return left(new ServerError());

    const bankAccount = eitherBankAccount.value;

    return right(bankAccount);
  };
}

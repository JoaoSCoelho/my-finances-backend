import { InvalidParamError } from '../errors/invalid-param-error';
import { Amount } from '../object-values/amout';
import { AnyNumber } from '../object-values/any-number';
import { BankAccountName } from '../object-values/bank-account-name';
import { ID } from '../object-values/id';
import { URL } from '../object-values/url';
import { Either, left, right } from '../shared/either';
import { IBankAccountObject } from './ports/bank-account';

export class BankAccount {
  private constructor(
    public readonly id: ID,
    public readonly userId: ID,
    public readonly createdTimestamp: AnyNumber,
    public readonly name: BankAccountName,
    public readonly amount: Amount,
    public readonly imageURL?: URL,
  ) {
    Object.freeze(this);
  }

  get value(): IBankAccountObject {
    return {
      id: this.id.value,
      userId: this.userId.value,
      createdTimestamp: this.createdTimestamp.value,
      name: this.name.value,
      amount: this.amount.value,
      imageURL: this.imageURL?.value,
    };
  }

  static create(
    bankAccount: Record<keyof IBankAccountObject, any>,
  ): Either<InvalidParamError, BankAccount> {
    const eitherId = ID.create(bankAccount.id);
    const eitherUserId = ID.create(bankAccount.userId);
    const eitherCreatedTimestamp = AnyNumber.create(
      bankAccount.createdTimestamp,
    );
    const eitherName = BankAccountName.create(bankAccount.name);
    const eitherAmount = Amount.create(bankAccount.amount);
    const eitherImageURL = bankAccount.imageURL
      ? URL.create(bankAccount.imageURL)
      : undefined;

    // Checks if there were any errors during the creation of object values

    if (eitherId.isLeft()) return left(eitherId.value);

    if (eitherName.isLeft()) return left(eitherName.value);
    if (eitherAmount.isLeft()) return left(eitherAmount.value);

    if (eitherUserId.isLeft())
      return left(
        new InvalidParamError(
          'userId',
          bankAccount.userId,
          eitherUserId.value.reason,
          eitherUserId.value.expected,
        ),
      );
    if (eitherCreatedTimestamp.isLeft())
      return left(
        new InvalidParamError(
          'createdTimestamp',
          bankAccount.createdTimestamp,
          eitherCreatedTimestamp.value.reason,
          eitherCreatedTimestamp.value.expected,
        ),
      );
    if (eitherImageURL && eitherImageURL.isLeft())
      return left(
        new InvalidParamError(
          'imageURL',
          bankAccount.imageURL,
          eitherImageURL.value.reason,
          eitherImageURL.value.expected,
        ),
      );

    const id = eitherId.value;
    const userId = eitherUserId.value;
    const createdTimestamp = eitherCreatedTimestamp.value;
    const name = eitherName.value;
    const amount = eitherAmount.value;
    const imageURL = eitherImageURL?.value;

    // Returns a new BankAccount entity

    return right(
      new BankAccount(id, userId, createdTimestamp, name, amount, imageURL),
    );
  }
}

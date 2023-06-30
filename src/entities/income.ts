import { InvalidParamError } from '../errors/invalid-param-error';
import { Amount } from '../object-values/amout';
import { AnyNumber } from '../object-values/any-number';
import { AnyString } from '../object-values/any-string';
import { ID } from '../object-values/id';
import { NoNegativeAmount } from '../object-values/no-negative-amount';
import { TransactionTitle } from '../object-values/transaction-title';
import { Either, left, right } from '../shared/either';

export interface IIncomeObject {
  id: string;
  bankAccountId: string;
  gain: number;
  description?: string;
  createdTimestamp: number;
  title: string;
}

export class Income {
  private constructor(
    public readonly id: ID,
    public readonly bankAccountId: ID,
    public readonly title: TransactionTitle,
    public readonly gain: NoNegativeAmount,
    public readonly createdTimestamp: AnyNumber,
    public readonly description?: AnyString,
  ) {
    Object.freeze(this);
  }

  get value(): IIncomeObject {
    return {
      id: this.id.value,
      bankAccountId: this.bankAccountId.value,
      description: this.description?.value,
      gain: this.gain.value,
      createdTimestamp: this.createdTimestamp.value,
      title: this.title.value,
    };
  }

  static create(
    income: Partial<Record<keyof IIncomeObject, any>>,
  ): Either<InvalidParamError, Income> {
    const eitherId = ID.create(income.id);
    const eitherBankAccountId = ID.create(income.bankAccountId);
    const eitherDescription = income.description
      ? AnyString.create(income.description)
      : undefined;
    const eitherGain = Amount.create(income.gain);
    const eitherCreatedTimestamp = AnyNumber.create(income.createdTimestamp);
    const eitherTitle = TransactionTitle.create(income.title);

    // Checks if there were any errors during the creation of object values

    if (eitherId.isLeft()) return left(eitherId.value);
    if (eitherTitle.isLeft()) return left(eitherTitle.value);
    if (eitherBankAccountId.isLeft())
      return left(
        new InvalidParamError(
          'bankAccountId',
          income.bankAccountId,
          eitherBankAccountId.value.reason,
          eitherBankAccountId.value.expected,
        ),
      );
    if (eitherDescription && eitherDescription.isLeft())
      return left(
        new InvalidParamError(
          'description',
          income.description,
          eitherDescription.value.reason,
          eitherDescription.value.expected,
        ),
      );
    if (eitherGain.isLeft())
      return left(
        new InvalidParamError(
          'gain',
          income.gain,
          eitherGain.value.reason,
          eitherGain.value.expected,
        ),
      );
    if (eitherCreatedTimestamp.isLeft())
      return left(
        new InvalidParamError(
          'createdTimestamp',
          income.createdTimestamp,
          eitherCreatedTimestamp.value.reason,
          eitherCreatedTimestamp.value.expected,
        ),
      );

    const id = eitherId.value;
    const bankAccountId = eitherBankAccountId.value;
    const description = eitherDescription?.value;
    const gain = eitherGain.value;
    const createdTimestamp = eitherCreatedTimestamp.value;
    const title = eitherTitle.value;

    // Returns a new Income entity

    return right(
      new Income(id, bankAccountId, title, gain, createdTimestamp, description),
    );
  }
}

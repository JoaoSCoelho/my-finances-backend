import { InvalidParamError } from '../errors/invalid-param-error';
import { Amount } from '../object-values/amout';
import { AnyNumber } from '../object-values/any-number';
import { AnyString } from '../object-values/any-string';
import { ID } from '../object-values/id';
import { NoNegativeAmount } from '../object-values/no-negative-amount';
import { TransactionTitle } from '../object-values/transaction-title';
import { Either, left, right } from '../shared/either';

export interface IExpenseObject {
  id: string;
  bankAccountId: string;
  spent: number;
  description?: string;
  createdTimestamp: number;
  title: string;
}

export class Expense {
  private constructor(
    public readonly id: ID,
    public readonly bankAccountId: ID,
    public readonly title: TransactionTitle,
    public readonly spent: NoNegativeAmount,
    public readonly createdTimestamp: AnyNumber,
    public readonly description?: AnyString,
  ) {
    Object.freeze(this);
  }

  get value(): IExpenseObject {
    return {
      id: this.id.value,
      bankAccountId: this.bankAccountId.value,
      description: this.description?.value,
      spent: this.spent.value,
      createdTimestamp: this.createdTimestamp.value,
      title: this.title.value,
    };
  }

  static create(
    expense: Partial<Record<keyof IExpenseObject, any>>,
  ): Either<InvalidParamError, Expense> {
    const eitherId = ID.create(expense.id);
    const eitherBankAccountId = ID.create(expense.bankAccountId);
    const eitherDescription = expense.description
      ? AnyString.create(expense.description)
      : undefined;
    const eitherSpent = Amount.create(expense.spent);
    const eitherCreatedTimestamp = AnyNumber.create(expense.createdTimestamp);
    const eitherTitle = TransactionTitle.create(expense.title);

    // Checks if there were any errors during the creation of object values

    if (eitherId.isLeft()) return left(eitherId.value);
    if (eitherTitle.isLeft()) return left(eitherTitle.value);
    if (eitherBankAccountId.isLeft())
      return left(
        new InvalidParamError(
          'bankAccountId',
          expense.bankAccountId,
          eitherBankAccountId.value.reason,
          eitherBankAccountId.value.expected,
        ),
      );
    if (eitherDescription && eitherDescription.isLeft())
      return left(
        new InvalidParamError(
          'description',
          expense.description,
          eitherDescription.value.reason,
          eitherDescription.value.expected,
        ),
      );
    if (eitherSpent.isLeft())
      return left(
        new InvalidParamError(
          'spent',
          expense.spent,
          eitherSpent.value.reason,
          eitherSpent.value.expected,
        ),
      );
    if (eitherCreatedTimestamp.isLeft())
      return left(
        new InvalidParamError(
          'createdTimestamp',
          expense.createdTimestamp,
          eitherCreatedTimestamp.value.reason,
          eitherCreatedTimestamp.value.expected,
        ),
      );

    const id = eitherId.value;
    const bankAccountId = eitherBankAccountId.value;
    const description = eitherDescription?.value;
    const spent = eitherSpent.value;
    const createdTimestamp = eitherCreatedTimestamp.value;
    const title = eitherTitle.value;

    // Returns a new Expense entity

    return right(
      new Expense(
        id,
        bankAccountId,
        title,
        spent,
        createdTimestamp,
        description,
      ),
    );
  }
}

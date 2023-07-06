import { InvalidParamError } from '../errors/invalid-param-error';
import { AnyNumber } from '../object-values/any-number';
import { AnyString } from '../object-values/any-string';
import { ID } from '../object-values/id';
import { NoNegativeAmount } from '../object-values/no-negative-amount';
import { TransactionTitle } from '../object-values/transaction-title';
import { Either, left, right } from '../shared/either';

export interface ITransferObject {
  id: string;
  giverBankAccountId: string;
  receiverBankAccountId: string;
  amount: number;
  description?: string;
  createdTimestamp: number;
  title: string;
}

export class Transfer {
  private constructor(
    public readonly id: ID,
    public readonly giverBankAccountId: ID,
    public readonly receiverBankAccountId: ID,
    public readonly title: TransactionTitle,
    public readonly amount: NoNegativeAmount,
    public readonly createdTimestamp: AnyNumber,
    public readonly description?: AnyString,
  ) {
    Object.freeze(this);
  }

  get value(): ITransferObject {
    return {
      id: this.id.value,
      giverBankAccountId: this.giverBankAccountId.value,
      receiverBankAccountId: this.receiverBankAccountId.value,
      description: this.description?.value,
      amount: this.amount.value,
      createdTimestamp: this.createdTimestamp.value,
      title: this.title.value,
    };
  }

  static create(
    transfer: Partial<Record<keyof ITransferObject, any>>,
  ): Either<InvalidParamError, Transfer> {
    const eitherId = ID.create(transfer.id);
    const eitherGiverBankAccountId = ID.create(transfer.giverBankAccountId);
    const eitherReceiverBankAccountId = ID.create(
      transfer.receiverBankAccountId,
    );
    const eitherDescription = transfer.description
      ? AnyString.create(transfer.description)
      : undefined;
    const eitherAmount = NoNegativeAmount.create(transfer.amount);
    const eitherCreatedTimestamp = AnyNumber.create(transfer.createdTimestamp);
    const eitherTitle = TransactionTitle.create(transfer.title);

    // Checks if there were any errors during the creation of object values

    if (eitherId.isLeft()) return left(eitherId.value);
    if (eitherTitle.isLeft()) return left(eitherTitle.value);
    if (eitherGiverBankAccountId.isLeft())
      return left(
        new InvalidParamError(
          'giverBankAccountId',
          transfer.giverBankAccountId,
          eitherGiverBankAccountId.value.reason,
          eitherGiverBankAccountId.value.expected,
        ),
      );
    if (eitherReceiverBankAccountId.isLeft())
      return left(
        new InvalidParamError(
          'receiverBankAccountId',
          transfer.receiverBankAccountId,
          eitherReceiverBankAccountId.value.reason,
          eitherReceiverBankAccountId.value.expected,
        ),
      );
    if (eitherDescription && eitherDescription.isLeft())
      return left(
        new InvalidParamError(
          'description',
          transfer.description,
          eitherDescription.value.reason,
          eitherDescription.value.expected,
        ),
      );
    if (eitherAmount.isLeft())
      return left(
        new InvalidParamError(
          'amount',
          transfer.amount,
          eitherAmount.value.reason,
          eitherAmount.value.expected,
        ),
      );
    if (eitherCreatedTimestamp.isLeft())
      return left(
        new InvalidParamError(
          'createdTimestamp',
          transfer.createdTimestamp,
          eitherCreatedTimestamp.value.reason,
          eitherCreatedTimestamp.value.expected,
        ),
      );

    const id = eitherId.value;
    const giverBankAccountId = eitherGiverBankAccountId.value;
    const receiverBankAccountId = eitherReceiverBankAccountId.value;
    const description = eitherDescription?.value;
    const amount = eitherAmount.value;
    const createdTimestamp = eitherCreatedTimestamp.value;
    const title = eitherTitle.value;

    // Returns a new Transfer entity

    return right(
      new Transfer(
        id,
        giverBankAccountId,
        receiverBankAccountId,
        title,
        amount,
        createdTimestamp,
        description,
      ),
    );
  }
}

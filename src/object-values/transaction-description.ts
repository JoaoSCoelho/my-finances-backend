import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class TransactionDescription {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static type = 'string';
  static maximumLength = 2048;

  static create(
    transactionDescription: any,
  ): Either<InvalidParamError, TransactionDescription> {
    if (typeof transactionDescription !== this.type)
      return left(
        new InvalidParamError(
          'transactionDescription',
          transactionDescription,
          'type not supported',
          this.type,
        ),
      );
    if (transactionDescription.length > this.maximumLength)
      return left(
        new InvalidParamError(
          'transactionDescription',
          transactionDescription,
          'greater than the maximum characters',
          `Less or equal than ${this.maximumLength} characters`,
        ),
      );

    return right(new TransactionDescription(transactionDescription));
  }
}

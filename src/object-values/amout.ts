import {
  InvalidParamError,
  InvalidParamReasons,
} from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class Amount {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static type = 'number';
  static minimum = -999999999999;
  static maximum = 999999999999;

  static create(amount: any): Either<InvalidParamError, Amount> {
    const genError = (reason: InvalidParamReasons, expected: string) =>
      new InvalidParamError('amount', amount, reason, expected);

    if (typeof amount !== this.type)
      return left(genError('type not supported', this.type));
    if (!Number.isSafeInteger(Math.round(amount)))
      return left(genError('is not a safe number', 'A safe number'));
    if (amount < this.minimum)
      return left(
        genError('less than the minimum', `More or equal than ${this.minimum}`),
      );
    if (amount > this.maximum)
      return left(
        genError('greater than maximum', `Less or equal than ${this.maximum}`),
      );

    return right(new Amount(amount));
  }
}

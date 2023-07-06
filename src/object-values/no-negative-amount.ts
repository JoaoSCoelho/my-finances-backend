import {
  InvalidParamError,
  InvalidParamReasons,
} from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class NoNegativeAmount {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static type = 'number';
  static minimum = 0;
  static maximum = 999999999999;

  static create(
    noNegativeAmount: any,
  ): Either<InvalidParamError, NoNegativeAmount> {
    const genError = (reason: InvalidParamReasons, expected: string) =>
      new InvalidParamError(
        'noNegativeAmount',
        noNegativeAmount,
        reason,
        expected,
      );

    if (typeof noNegativeAmount !== this.type)
      return left(genError('type not supported', this.type));
    if (!Number.isSafeInteger(Math.round(noNegativeAmount)))
      return left(genError('is not a safe number', 'A safe number'));
    if (noNegativeAmount < this.minimum)
      return left(
        genError('less than the minimum', `More or equal than ${this.minimum}`),
      );
    if (noNegativeAmount > this.maximum)
      return left(
        genError(
          'greater than the maximum',
          `Less or equal than ${this.maximum}`,
        ),
      );

    return right(new NoNegativeAmount(noNegativeAmount));
  }
}

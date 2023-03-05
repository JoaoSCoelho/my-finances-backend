import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class AnyNumber {
  private constructor(readonly value: number) {
    Object.freeze(this);
  }

  static type = 'number';

  static create(anyNumber: any): Either<InvalidParamError, AnyNumber> {
    if (typeof anyNumber !== this.type)
      return left(
        new InvalidParamError(
          'anyNumber',
          anyNumber,
          'type not supported',
          this.type,
        ),
      );

    return right(new AnyNumber(anyNumber));
  }
}

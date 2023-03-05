import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class AnyString {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static type = 'string';

  static create(anyString: any): Either<InvalidParamError, AnyString> {
    if (typeof anyString !== this.type)
      return left(
        new InvalidParamError(
          'anyString',
          anyString,
          'type not supported',
          this.type,
        ),
      );

    return right(new AnyString(anyString));
  }
}

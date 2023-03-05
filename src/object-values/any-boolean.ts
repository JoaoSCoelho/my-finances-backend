import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class AnyBoolean {
  private constructor(readonly value: boolean) {
    Object.freeze(this);
  }

  static type = 'boolean';

  static create(anyBoolean: any): Either<InvalidParamError, AnyBoolean> {
    if (typeof anyBoolean !== this.type)
      return left(
        new InvalidParamError(
          'anyBoolean',
          anyBoolean,
          'type not supported',
          this.type,
        ),
      );

    return right(new AnyBoolean(anyBoolean));
  }
}

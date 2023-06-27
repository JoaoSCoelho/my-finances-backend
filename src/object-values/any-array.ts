import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class AnyArray<T = any> {
  private constructor(readonly value: Array<T>) {
    Object.freeze(this);
  }

  static type = 'array';

  static create(anyArray: any): Either<InvalidParamError, AnyArray> {
    if (!Array.isArray(anyArray)) {
      return left(
        new InvalidParamError(
          'anyArray',
          anyArray,
          'type not supported',
          this.type,
        ),
      );
    }

    return right(new this(anyArray));
  }
}

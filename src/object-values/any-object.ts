import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class AnyObject {
  private constructor(readonly value: Record<any, any>) {
    Object.freeze(this);
  }

  static type = 'object';

  static create(anyObject: any): Either<InvalidParamError, AnyObject> {
    if (
      typeof anyObject !== this.type ||
      Array.isArray(anyObject) ||
      anyObject === null
    ) {
      return left(
        new InvalidParamError(
          'anyObject',
          anyObject,
          'type not supported',
          this.type,
        ),
      );
    }

    return right(new this(anyObject));
  }
}

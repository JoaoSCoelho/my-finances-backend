import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class ID {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static size = 21;
  static type = 'string';

  static create(id: any): Either<InvalidParamError, ID> {
    if (typeof id !== this.type)
      return left(
        new InvalidParamError('id', id, 'type not supported', this.type),
      );
    if (id.length !== this.size)
      return left(
        new InvalidParamError(
          'id',
          id,
          'incorrect structure',
          `Size must be equal to ${this.size} characters`,
        ),
      );

    return right(new ID(id));
  }
}

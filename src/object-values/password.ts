import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class Password {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static type = 'string';
  static minimumLength = 6;
  static maximumLength = 100;
  static letterStructure = () => /[a-zÀ-ÿ]+/gi;
  static numberStructure = () => /\d+/g;

  static create(password: any): Either<InvalidParamError, Password> {
    if (typeof password !== this.type)
      return left(
        new InvalidParamError(
          'password',
          password,
          'type not supported',
          this.type,
        ),
      );
    if (password.length < this.minimumLength)
      return left(
        new InvalidParamError(
          'password',
          password,
          'less than the minimum characters',
          `More or equal than ${this.minimumLength} characters`,
        ),
      );
    if (password.length > this.maximumLength)
      return left(
        new InvalidParamError(
          'password',
          password,
          'greater than maximum characters',
          `Less or equal than ${this.maximumLength} characters`,
        ),
      );
    if (!this.letterStructure().test(password))
      return left(
        new InvalidParamError(
          'password',
          password,
          'incorrect structure',
          'At least one letter',
        ),
      );
    if (!this.numberStructure().test(password))
      return left(
        new InvalidParamError(
          'password',
          password,
          'incorrect structure',
          'At least one number',
        ),
      );

    return right(new Password(password));
  }
}

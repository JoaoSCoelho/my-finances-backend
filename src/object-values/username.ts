import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class Username {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static type = 'string';
  static minimumLength = 3;
  static maximumLength = 30;
  static validCharacters = () =>
    /^[\dA-Za-záàâãäéèêëíïìîóôõöòúùûüçñÁÀÂÃÄÉÈÊËÍÏÌÎÓÔÕÖÒÚÙÛÜÇÑ !@#$%¨&*_()+=\-:/'",§<>.|`´^~ºª?°]+$/gi;

  static create(username: any): Either<InvalidParamError, Username> {
    if (typeof username !== this.type)
      return left(
        new InvalidParamError(
          'username',
          username,
          'type not supported',
          this.type,
        ),
      );
    if (username.length < this.minimumLength)
      return left(
        new InvalidParamError(
          'username',
          username,
          'less than the minimum characters',
          `More or equal than ${this.minimumLength} characters`,
        ),
      );
    if (username.length > this.maximumLength)
      return left(
        new InvalidParamError(
          'username',
          username,
          'greater than maximum characters',
          `Less or equal than ${this.maximumLength} characters`,
        ),
      );
    if (!this.validCharacters().test(username))
      return left(
        new InvalidParamError(
          'username',
          username,
          'invalid characters',
          'It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters',
        ),
      );

    return right(new Username(username));
  }
}

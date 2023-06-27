import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class BankAccountName {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static type = 'string';
  static minimumLength = 3;
  static maximumLength = 30;
  static validCharacters = () =>
    /^[\dA-Za-záàâãäéèêëíïìîóôõöòúùûüçñÁÀÂÃÄÉÈÊËÍÏÌÎÓÔÕÖÒÚÙÛÜÇÑ !@#$%¨&*_()+=\-:/'",§<>.|`´^~ºª?°]+$/gi;

  static create(
    bankAccountName: any,
  ): Either<InvalidParamError, BankAccountName> {
    if (typeof bankAccountName !== this.type)
      return left(
        new InvalidParamError(
          'bankAccountName',
          bankAccountName,
          'type not supported',
          this.type,
        ),
      );
    if (bankAccountName.length < this.minimumLength)
      return left(
        new InvalidParamError(
          'bankAccountName',
          bankAccountName,
          'less than the minimum characters',
          `More or equal than ${this.minimumLength} characters`,
        ),
      );
    if (bankAccountName.length > this.maximumLength)
      return left(
        new InvalidParamError(
          'bankAccountName',
          bankAccountName,
          'greater than the maximum characters',
          `Less or equal than ${this.maximumLength} characters`,
        ),
      );
    if (!this.validCharacters().test(bankAccountName))
      return left(
        new InvalidParamError(
          'bankAccountName',
          bankAccountName,
          'invalid characters',
          'It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters',
        ),
      );

    return right(new BankAccountName(bankAccountName));
  }
}

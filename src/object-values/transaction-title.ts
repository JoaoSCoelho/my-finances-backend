import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class TransactionTitle {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static type = 'string';
  static minimumLength = 3;
  static maximumLength = 50;
  static validCharacters = () =>
    /^[\dA-Za-záàâãäéèêëíïìîóôõöòúùûüçñÁÀÂÃÄÉÈÊËÍÏÌÎÓÔÕÖÒÚÙÛÜÇÑ !@#$%¨&*_()+=\-:/'",§<>.|`´^~ºª?°]+$/gi;

  static create(
    transactionTitle: any,
  ): Either<InvalidParamError, TransactionTitle> {
    if (typeof transactionTitle !== this.type)
      return left(
        new InvalidParamError(
          'transactionTitle',
          transactionTitle,
          'type not supported',
          this.type,
        ),
      );
    if (transactionTitle.length < this.minimumLength)
      return left(
        new InvalidParamError(
          'transactionTitle',
          transactionTitle,
          'less than the minimum characters',
          `More or equal than ${this.minimumLength} characters`,
        ),
      );
    if (transactionTitle.length > this.maximumLength)
      return left(
        new InvalidParamError(
          'transactionTitle',
          transactionTitle,
          'greater than the maximum characters',
          `Less or equal than ${this.maximumLength} characters`,
        ),
      );
    if (!this.validCharacters().test(transactionTitle))
      return left(
        new InvalidParamError(
          'transactionTitle',
          transactionTitle,
          'invalid characters',
          'It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters',
        ),
      );

    return right(new TransactionTitle(transactionTitle));
  }
}

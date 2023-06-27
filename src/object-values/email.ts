import { InvalidParamError } from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class Email {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  // Parameters to be considered an email

  static type = 'string';
  static maximumLength = 128;
  static atSignStructure = () => /^[^@]+@[^@]+$/g;
  static emailUsernameCharacters = () => /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@/gi;
  // eslint-disable-next-line no-useless-escape
  static emailDomainCharacters = () => /@[a-z0-9-\.]+$/gi;
  static emailDomainStructure = () =>
    /@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/gi;
  static structure = () =>
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/gi;

  // Method that truly creates a new object value

  static create(email: any): Either<InvalidParamError, Email> {
    if (typeof email !== this.type)
      return left(
        new InvalidParamError('email', email, 'type not supported', this.type),
      );
    if (email.length > this.maximumLength)
      return left(
        new InvalidParamError(
          'email',
          email,
          'greater than the maximum characters',
          `Less or equal than ${this.maximumLength} characters`,
        ),
      );
    if (!this.atSignStructure().test(email))
      return left(
        new InvalidParamError(
          'email',
          email,
          'incorrect structure',
          'An email address must have one and only one at sign',
        ),
      );
    if (!this.emailUsernameCharacters().test(email))
      return left(
        new InvalidParamError(
          'email',
          email,
          'invalid characters',
          'The first part of an email must contain letters, numbers or some special characters',
        ),
      );
    if (!this.emailDomainCharacters().test(email))
      return left(
        new InvalidParamError(
          'email',
          email,
          'invalid characters',
          'The domain of an email must contain only alphanumeric characters, hyphens and periods',
        ),
      );
    if (!this.emailDomainStructure().test(email))
      return left(
        new InvalidParamError(
          'email',
          email,
          'incorrect structure',
          'The domain of an email must contain at least one period to separate the domain name of the TLD, among other parts',
        ),
      );
    if (!this.structure().test(email))
      return left(
        new InvalidParamError(
          'email',
          email,
          'incorrect structure',
          'A valid email address',
        ),
      );

    return right(new Email(email));
  }
}

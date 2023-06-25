import { InvalidParamError } from '../errors/invalid-param-error';
import { AnyArray } from '../object-values/any-array';
import { AnyBoolean } from '../object-values/any-boolean';
import { AnyNumber } from '../object-values/any-number';
import { AnyString } from '../object-values/any-string';
import { Email } from '../object-values/email';
import { ID } from '../object-values/id';
import { Username } from '../object-values/username';
import { Either, left, right } from '../shared/either';
import { IUserObject } from './ports/user';

export class User {
  private constructor(
    public readonly id: ID,
    public readonly username: Username,
    public readonly email: Email,
    public readonly confirmedEmail: AnyBoolean,
    public readonly createdTimestamp: AnyNumber,
    public readonly hashPassword: AnyString,
    public readonly refreshTokens: AnyArray<AnyString>,
  ) {
    Object.freeze(this);
  }

  get value(): IUserObject {
    return {
      id: this.id.value,
      username: this.username.value,
      email: this.email.value,
      confirmedEmail: this.confirmedEmail.value,
      createdTimestamp: this.createdTimestamp.value,
      hashPassword: this.hashPassword.value,
      refreshTokens: this.refreshTokens.value.map((rt) => rt.value),
    };
  }

  get noConfidentialValue(): Omit<
    IUserObject,
    'hashPassword' | 'refreshTokens'
  > {
    return {
      id: this.id.value,
      username: this.username.value,
      email: this.email.value,
      confirmedEmail: this.confirmedEmail.value,
      createdTimestamp: this.createdTimestamp.value,
    };
  }

  static create(
    user: Record<keyof IUserObject, any>,
  ): Either<InvalidParamError, User> {
    const eitherId = ID.create(user.id);
    const eitherUsername = Username.create(user.username);
    const eitherEmail = Email.create(user.email);
    const eitherHashPassword = AnyString.create(user.hashPassword);
    const eitherCreatedTimestamp = AnyNumber.create(user.createdTimestamp);
    const eitherConfirmedEmail = AnyBoolean.create(user.confirmedEmail);
    const eitherRefreshTokens = AnyArray.create(user.refreshTokens);

    // Checks if there were any errors during the creation of object values

    if (eitherId.isLeft()) return left(eitherId.value);
    if (eitherUsername.isLeft()) return left(eitherUsername.value);
    if (eitherEmail.isLeft()) return left(eitherEmail.value);
    if (eitherHashPassword.isLeft())
      return left(
        new InvalidParamError(
          'hashPassword',
          user.hashPassword,
          eitherHashPassword.value.reason,
          eitherHashPassword.value.expected,
        ),
      );
    if (eitherCreatedTimestamp.isLeft())
      return left(
        new InvalidParamError(
          'createdTimestamp',
          user.createdTimestamp,
          eitherCreatedTimestamp.value.reason,
          eitherCreatedTimestamp.value.expected,
        ),
      );
    if (eitherConfirmedEmail.isLeft())
      return left(
        new InvalidParamError(
          'confirmedEmail',
          user.confirmedEmail,
          eitherConfirmedEmail.value.reason,
          eitherConfirmedEmail.value.expected,
        ),
      );
    if (eitherRefreshTokens.isLeft())
      return left(
        new InvalidParamError(
          'refreshTokens',
          user.refreshTokens,
          eitherRefreshTokens.value.reason,
          eitherRefreshTokens.value.expected,
        ),
      );

    const refreshTokens = eitherRefreshTokens.value;
    const id = eitherId.value;
    const username = eitherUsername.value;
    const email = eitherEmail.value;
    const hashPassword = eitherHashPassword.value;
    const createdTimestamp = eitherCreatedTimestamp.value;
    const confirmedEmail = eitherConfirmedEmail.value;

    const someInvalidRefreshToken = refreshTokens.value.reduce((_, curr) => {
      const eitherRefreshToken = AnyString.create(curr);

      if (eitherRefreshToken.isLeft()) return eitherRefreshToken.value;
    }, undefined) as InvalidParamError | undefined;

    if (someInvalidRefreshToken)
      return left(
        new InvalidParamError(
          'refreshToken',
          someInvalidRefreshToken.param,
          someInvalidRefreshToken.reason,
          someInvalidRefreshToken.expected,
        ),
      );

    // Returns a new User entity

    return right(
      new User(
        id,
        username,
        email,
        confirmedEmail,
        createdTimestamp,
        hashPassword,
        refreshTokens,
      ),
    );
  }
}

import { User } from '../entities/user';
import { InvalidCredentialsError } from '../errors/invalid-credentials-error';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { EncryptorProvider } from '../external/ports/encryptor-provider';
import { UsersRepository } from '../external/ports/users-repository';
import { Email } from '../object-values/email';
import { Password } from '../object-values/password';
import { Either, left, right } from '../shared/either';

export class LoginUC {
  constructor(
    private usersRepository: UsersRepository,
    private encryptorProvider: EncryptorProvider,
  ) {}

  async execute(
    possiblyEmail: any,
    possiblyPassword: any,
  ): Promise<
    Either<
      | ServerError
      | InvalidParamError
      | ThereIsNoEntityWithThisPropError
      | InvalidCredentialsError,
      User
    >
  > {
    const eitherEmail = Email.create(possiblyEmail);

    if (eitherEmail.isLeft())
      return left(
        new InvalidParamError(
          'email',
          possiblyEmail,
          eitherEmail.value.reason,
          eitherEmail.value.expected,
        ),
      );

    const email = eitherEmail.value.value.toLowerCase();

    const eitherPassword = Password.create(possiblyPassword);

    if (eitherPassword.isLeft())
      return left(
        new InvalidParamError(
          'password',
          possiblyPassword,
          eitherPassword.value.reason,
          eitherPassword.value.expected,
        ),
      );

    const password = eitherPassword.value.value;

    const eitherUserObject = await this.usersRepository.getByEmail(email);

    if (eitherUserObject.isLeft())
      return left(new ThereIsNoEntityWithThisPropError('user', 'email', email));

    const userObject = eitherUserObject.value;

    const eitherUser = User.create(userObject);

    if (eitherUser.isLeft()) return left(new ServerError('internal'));

    const user = eitherUser.value;

    const isValidPassword = this.encryptorProvider.compare(
      password,
      user.hashPassword.value,
    );

    if (!isValidPassword) return left(new InvalidCredentialsError());

    return right(user);
  }
}

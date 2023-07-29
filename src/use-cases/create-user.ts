import { apiEnv } from '../config/env';
import { User } from '../entities/user';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ThereIsAlreadyEntityWithThisPropError } from '../errors/there-is-already-entity-with-this-prop-error';
import { EncryptorProvider } from '../external/ports/encryptor-provider';
import { GeneratorIDProvider } from '../external/ports/generator-id-provider';
import { UsersRepository } from '../external/ports/users-repository';
import { Email } from '../object-values/email';
import { Password } from '../object-values/password';
import { Either, left, right } from '../shared/either';

export interface ICreateUserDTO {
  username: string;
  email: string;
  password: string;
  profileImageURL: string;
}

export class CreateUserUC {
  constructor(
    private encryptor: EncryptorProvider,
    private generatorID: GeneratorIDProvider,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    data: Record<keyof ICreateUserDTO, any>,
  ): Promise<
    Either<InvalidParamError | ThereIsAlreadyEntityWithThisPropError, User>
  > {
    // Checks the structure of the received password and e-mail

    const eitherPassword = Password.create(data.password);

    if (eitherPassword.isLeft()) return left(eitherPassword.value);

    const { value: password } = eitherPassword.value;
    const hashPassword = this.encryptor.encrypt(
      password,
      apiEnv.DEFAULT_ENCRYPTOR_SALTS,
    );

    const eitherEmail = Email.create(data.email);

    if (eitherEmail.isLeft()) return left(eitherEmail.value);

    const { value: email } = eitherEmail.value;

    // Create a new User entity

    const eitherUser = User.create({
      id: this.generatorID.generate(),
      username: data.username,
      email: email.toLowerCase(),
      hashPassword,
      confirmedEmail: false,
      createdTimestamp: Date.now(),
      refreshTokens: [],
      profileImageURL: data.profileImageURL,
    });

    if (eitherUser.isLeft()) return left(eitherUser.value);

    const user = eitherUser.value;

    // Checks if exists a user in database with this email

    const existsWithThisEmail = await this.usersRepository.existsWithThisEmail(
      user.email.value,
    );

    if (existsWithThisEmail)
      return left(
        new ThereIsAlreadyEntityWithThisPropError(
          'user',
          'email',
          user.email.value,
        ),
      );

    // Register the user on the database

    await this.usersRepository.set(user.value);

    return right(user);
  }
}

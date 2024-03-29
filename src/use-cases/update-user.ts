import { IUserObject, User } from '../entities/user';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsAlreadyEntityWithThisPropError } from '../errors/there-is-already-entity-with-this-prop-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { UsersRepository } from '../external/ports/users-repository';
import { Email } from '../object-values/email';
import { URL } from '../object-values/url';
import { Username } from '../object-values/username';
import { Either, left, right } from '../shared/either';

export class UpdateUserUC {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    userID: string,
    data: Partial<
      Pick<
        Record<keyof IUserObject, any>,
        'email' | 'profileImageURL' | 'username'
      >
    >,
  ): Promise<
    Either<
      | InvalidParamError
      | ThereIsNoEntityWithThisPropError
      | ThereIsAlreadyEntityWithThisPropError
      | ServerError,
      User
    >
  > {
    const eitherUsername = Username.create(data.username);

    if (data.username !== undefined && eitherUsername.isLeft())
      return left(eitherUsername.value);

    const eitherProfileImageURL = URL.create(data.profileImageURL);

    if (data.profileImageURL != undefined && eitherProfileImageURL.isLeft())
      return left(
        new InvalidParamError(
          'profileImageURL',
          data.profileImageURL,
          eitherProfileImageURL.value.reason,
          eitherProfileImageURL.value.expected,
        ),
      );

    const eitherEmail = Email.create(data.email);

    if (data.email !== undefined) {
      if (eitherEmail.isLeft()) return left(eitherEmail.value);
      else {
        const loweredEmail = eitherEmail.value.value.toLowerCase();

        data.email = data.email.toLowerCase();

        const existsWithThisEmail =
          await this.usersRepository.existsWithThisEmail(loweredEmail);

        if (existsWithThisEmail)
          return left(
            new ThereIsAlreadyEntityWithThisPropError(
              'user',
              'email',
              loweredEmail,
            ),
          );
      }
    }

    const eitherUpdatedUserObject = await this.usersRepository.update(userID, {
      ...data,
      profileImageURL:
        data.profileImageURL == undefined ? undefined : data.profileImageURL,
      confirmedEmail: data.email ? false : true,
    });

    if (eitherUpdatedUserObject.isLeft())
      return left(new ThereIsNoEntityWithThisPropError('user', 'id', userID));

    let updatedUserObject = eitherUpdatedUserObject.value;

    if (data.profileImageURL === null) {
      const eitherRemovedPropUserObject =
        await this.usersRepository.deleteProps(userID, ['profileImageURL']);

      if (eitherRemovedPropUserObject.isLeft())
        return left(new ThereIsNoEntityWithThisPropError('user', 'id', userID));

      updatedUserObject = eitherRemovedPropUserObject.value;
    }

    const eitherUpdatedUser = User.create(updatedUserObject);

    if (eitherUpdatedUser.isLeft()) return left(new ServerError());

    const updatedUser = eitherUpdatedUser.value;

    return right(updatedUser);
  }
}

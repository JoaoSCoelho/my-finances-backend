import { User } from '../entities/user';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { UsersRepository } from '../external/ports/users-repository';
import { AnyObject } from '../object-values/any-object';
import { URL } from '../object-values/url';
import { Username } from '../object-values/username';
import { Either, left, right } from '../shared/either';

export class UpdateUserUC {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    userID: string,
    anyUpdateObject: any,
  ): Promise<
    Either<
      InvalidParamError | ThereIsNoEntityWithThisPropError | ServerError,
      User
    >
  > {
    const eitherUpdateObject = AnyObject.create(anyUpdateObject);

    if (eitherUpdateObject.isLeft()) {
      const {
        value: { reason, expected },
      } = eitherUpdateObject;

      return left(
        new InvalidParamError(
          'updateObject',
          anyUpdateObject,
          reason,
          expected,
        ),
      );
    }

    const { value: updateObject } = eitherUpdateObject.value;

    const data = {
      username: updateObject.username,
      profileImageURL: updateObject.profileImageURL,
    };

    const eitherUsername = Username.create(data.username);

    if (data.username !== undefined && eitherUsername.isLeft())
      return left(eitherUsername.value);

    const eitherProfileImageURL = URL.create(data.profileImageURL);

    if (data.profileImageURL !== undefined && eitherProfileImageURL.isLeft())
      return left(
        new InvalidParamError(
          'profileImageURL',
          data.profileImageURL,
          eitherProfileImageURL.value.reason,
          eitherProfileImageURL.value.expected,
        ),
      );

    const eitherUpdatedUserObject = await this.usersRepository.update(
      userID,
      data,
    );

    if (eitherUpdatedUserObject.isLeft())
      return left(new ThereIsNoEntityWithThisPropError('user', 'id', userID));

    const updatedUserObject = eitherUpdatedUserObject.value;

    const eitherUpdatedUser = User.create(updatedUserObject);

    if (eitherUpdatedUser.isLeft()) return left(new ServerError());

    const updatedUser = eitherUpdatedUser.value;

    return right(updatedUser);
  }
}

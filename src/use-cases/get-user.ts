import { User } from '../entities/user';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { UsersRepository } from '../external/ports/users-repository';
import { left, right } from '../shared/either';
import { ExecuteMethod } from './ports/get-user';

export class GetUserUC {
  constructor(private usersRepository: UsersRepository) {}

  execute: ExecuteMethod = async (userID) => {
    const eitherUserObject = await this.usersRepository.getById(userID);

    if (eitherUserObject.isLeft())
      return left(new ThereIsNoEntityWithThisPropError('user', 'id', userID));

    const userObject = eitherUserObject.value;

    const eitherUser = User.create(userObject);

    if (eitherUser.isLeft()) return left(new ServerError('internal'));

    const user = eitherUser.value;

    return right(user);
  };
}

import { User } from '../../../entities/user';
import { ServerError } from '../../../errors/server-error';
import { left, right } from '../../../shared/either';
import {
  DeleteMethod,
  ExistsWithThisEmailMethod,
  ExistsWithThisIDMethod,
  FilterEqualMethod,
  GetByEmailMethod,
  GetByIdMethod,
  SetMethod,
  UpdatePropMethod,
  UsersRepository,
} from '../../ports/users-repository';
import { UserModel } from './model';

export class MongoUsers implements UsersRepository {
  existsWithThisEmail: ExistsWithThisEmailMethod = async (email) => {
    const documentWithThisEmail = await UserModel.exists({ email });

    if (!documentWithThisEmail) return false;

    return true;
  };

  existsWithThisID: ExistsWithThisIDMethod = async (userID) => {
    const documentWithThisID = await UserModel.exists({ id: userID });

    if (!documentWithThisID) return false;

    return true;
  };

  set: SetMethod = async (user) => {
    await UserModel.create(user);

    return user;
  };

  updateProp: UpdatePropMethod = async (userID, key, value) => {
    const dbUser = await UserModel.findOneAndUpdate(
      { id: userID },
      { [key]: value },
      { new: true },
    );

    if (!dbUser) return left(null);

    const eitherUser = User.create(dbUser);

    if (eitherUser.isLeft()) throw new ServerError('internal');

    const user = eitherUser.value;

    return right(user.value);
  };

  delete: DeleteMethod = async (userID) => {
    await UserModel.findOneAndDelete({ id: userID });

    return;
  };

  filterEqual: FilterEqualMethod = async (key, value) => {
    const dbUsers = await UserModel.find({ [key]: value });

    return dbUsers.map((dbUser) => {
      const eitherUser = User.create(dbUser);

      if (eitherUser.isLeft()) throw new ServerError('internal');

      const user = eitherUser.value;

      return user.value;
    });
  };

  getById: GetByIdMethod = async (userID) => {
    const dbUser = await UserModel.findOne({ id: userID });

    if (!dbUser) return left(null);

    const eitherUser = User.create(dbUser);

    if (eitherUser.isLeft()) throw new ServerError('internal');

    const user = eitherUser.value;

    return right(user.value);
  };

  getByEmail: GetByEmailMethod = async (email) => {
    const dbUser = await UserModel.findOne({ email });

    if (!dbUser) return left(null);

    const eitherUser = User.create(dbUser);

    if (eitherUser.isLeft()) throw new ServerError('internal');

    const user = eitherUser.value;

    return right(user.value);
  };
}

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
    const user = await UserModel.findOneAndUpdate(
      { id: userID },
      { [key]: value },
      { new: true },
    );

    if (!user) return left(null);

    return right({
      id: user.id,
      username: user.username,
      email: user.email,
      confirmedEmail: user.confirmedEmail,
      hashPassword: user.hashPassword,
      createdTimestamp: user.createdTimestamp,
    });
  };

  delete: DeleteMethod = async (userID) => {
    await UserModel.findOneAndDelete({ id: userID });

    return;
  };

  filterEqual: FilterEqualMethod = async (key, value) => {
    const users = await UserModel.find({ [key]: value });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      hashPassword: user.hashPassword,
      confirmedEmail: user.confirmedEmail,
      createdTimestamp: user.createdTimestamp,
    }));
  };

  getById: GetByIdMethod = async (userID) => {
    const user = await UserModel.findOne({ id: userID });

    if (!user) return left(null);

    return right({
      username: user.username,
      email: user.email,
      id: user.id,
      hashPassword: user.hashPassword,
      createdTimestamp: user.createdTimestamp,
      confirmedEmail: user.confirmedEmail,
    });
  };

  getByEmail: GetByEmailMethod = async (email) => {
    const user = await UserModel.findOne({ email });

    if (!user) return left(null);

    return right({
      username: user.username,
      email: user.email,
      id: user.id,
      hashPassword: user.hashPassword,
      createdTimestamp: user.createdTimestamp,
      confirmedEmail: user.confirmedEmail,
    });
  };
}

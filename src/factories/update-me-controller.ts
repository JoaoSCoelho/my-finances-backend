import { UpdateMeController } from '../adapters/controllers/update-me-controller';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { UpdateUserUC } from '../use-cases/update-user';

export function makeUpdateMeController() {
  const usersRepository = new MongoUsers();
  const updateUserUC = new UpdateUserUC(usersRepository);
  const updateMeController = new UpdateMeController(updateUserUC);

  return updateMeController;
}

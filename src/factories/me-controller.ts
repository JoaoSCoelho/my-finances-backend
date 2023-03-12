import { MeController } from '../adapters/controllers/me-controller';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { GetUserUC } from '../use-cases/get-user';

export function makeMeController(): MeController {
  const usersRepository = new MongoUsers();
  const getUserUC = new GetUserUC(usersRepository);
  const meController = new MeController(getUserUC);

  return meController;
}

import { ConfirmEmailController } from '../adapters/controllers/confirm-email-controller';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { Jwt } from '../external/token-manager/jwt';
import { ConfirmEmailUC } from '../use-cases/confirm-email';

export function makeConfirmEmailController() {
  const tokenManager = new Jwt();
  const usersRepository = new MongoUsers();
  const confirmEmailUC = new ConfirmEmailUC(tokenManager, usersRepository);
  const confirmEmailController = new ConfirmEmailController(confirmEmailUC);

  return confirmEmailController;
}

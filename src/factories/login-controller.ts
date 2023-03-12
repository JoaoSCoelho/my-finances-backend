import { LoginController } from '../adapters/controllers/login-controller';
import { Bcrypt } from '../external/encryptor-providers/bcrypt';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { Jwt } from '../external/token-manager/jwt';
import { CreateAuthTokenUC } from '../use-cases/create-auth-token';
import { LoginUC } from '../use-cases/login';

export function makeLoginController() {
  const usersRepository = new MongoUsers();
  const encryptorProvider = new Bcrypt();
  const loginUC = new LoginUC(usersRepository, encryptorProvider);
  const tokenManager = new Jwt();
  const createAuthTokenUC = new CreateAuthTokenUC(tokenManager);
  const loginController = new LoginController(loginUC, createAuthTokenUC);

  return loginController;
}

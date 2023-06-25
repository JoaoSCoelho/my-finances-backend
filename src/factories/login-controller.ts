import { LoginController } from '../adapters/controllers/login-controller';
import { Bcrypt } from '../external/encryptor-providers/bcrypt';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { Jwt } from '../external/token-manager/jwt';
import { CreateAccessTokenUC } from '../use-cases/create-access-token';
import { CreateRefreshTokenUC } from '../use-cases/create-refresh-token';
import { LoginUC } from '../use-cases/login';

export function makeLoginController() {
  const usersRepository = new MongoUsers();
  const encryptorProvider = new Bcrypt();
  const loginUC = new LoginUC(usersRepository, encryptorProvider);
  const tokenManager = new Jwt();
  const createAccessTokenUC = new CreateAccessTokenUC(tokenManager);
  const createRefreshTokenUC = new CreateRefreshTokenUC(
    tokenManager,
    usersRepository,
  );
  const loginController = new LoginController(
    loginUC,
    createAccessTokenUC,
    createRefreshTokenUC,
  );

  return loginController;
}

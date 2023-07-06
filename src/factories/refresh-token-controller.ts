import { RefreshTokenController } from '../adapters/controllers/refresh-token-controller';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { Jwt } from '../external/token-manager/jwt';
import { CreateAccessTokenUC } from '../use-cases/create-access-token';
import { CreateRefreshTokenUC } from '../use-cases/create-refresh-token';
import { ValidateRefreshTokenUC } from '../use-cases/validate-refresh-token';

export function makeRefreshTokenController() {
  const tokenManager = new Jwt();
  const createAccessTokenUC = new CreateAccessTokenUC(tokenManager);
  const usersRepository = new MongoUsers();
  const createRefreshTokenUC = new CreateRefreshTokenUC(
    tokenManager,
    usersRepository,
  );
  const validateRefreshTokenUC = new ValidateRefreshTokenUC(
    usersRepository,
    tokenManager,
  );
  const refreshTokenController = new RefreshTokenController(
    createAccessTokenUC,
    createRefreshTokenUC,
    validateRefreshTokenUC,
  );

  return refreshTokenController;
}

import { AuthMiddleware } from '../adapters/middlewares/auth';
import { Jwt } from '../external/token-manager/jwt';

export function makeAuthMiddleware(): AuthMiddleware {
  const tokenManager = new Jwt();
  const authMiddleware = new AuthMiddleware(tokenManager);

  return authMiddleware;
}

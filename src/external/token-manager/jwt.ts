import jsonwebtoken from 'jsonwebtoken';

import { GenerateMethod, TokenManager } from '../ports/token-manager';

export class Jwt implements TokenManager {
  generate: GenerateMethod = (payload, secret, expiresIn) => {
    return jsonwebtoken.sign(payload, secret, { expiresIn });
  };
}

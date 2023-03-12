import jsonwebtoken from 'jsonwebtoken';

import {
  GenerateMethod,
  GenericPayload,
  TokenManager,
  VerifyMethod,
} from '../ports/token-manager';

export class Jwt implements TokenManager {
  generate: GenerateMethod = (payload, secret, expiresIn) => {
    return jsonwebtoken.sign(payload, secret, { expiresIn });
  };

  verify: VerifyMethod = (token, secret) => {
    return jsonwebtoken.verify(token, secret) as GenericPayload;
  };
}

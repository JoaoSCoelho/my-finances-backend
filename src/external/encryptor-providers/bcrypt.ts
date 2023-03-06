import { compareSync, hashSync } from 'bcrypt';

import {
  CompareMethod,
  EncryptMethod,
  EncryptorProvider,
} from '../ports/encryptor-provider';

export class Bcrypt implements EncryptorProvider {
  encrypt: EncryptMethod = (data, salts) => {
    return hashSync(data, salts);
  };

  compare: CompareMethod = compareSync;
}

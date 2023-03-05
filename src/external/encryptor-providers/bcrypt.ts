import { compareSync, hashSync } from 'bcrypt';

import config from '../../../config.json';
import {
  CompareMethod,
  EncryptMethod,
  EncryptorProvider,
} from '../ports/encryptor-provider';

export class Bcrypt implements EncryptorProvider {
  encrypt: EncryptMethod = (data, salts = config.encryptor_salts) => {
    return hashSync(data, salts);
  };

  compare: CompareMethod = compareSync;
}

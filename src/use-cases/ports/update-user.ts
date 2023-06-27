import { User } from '../../entities/user';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export type ExecuteMethod = (
  userID: string,
  updateObject: any,
) => Promise<
  Either<
    InvalidParamError | ThereIsNoEntityWithThisPropError | ServerError,
    User
  >
>;

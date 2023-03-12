import { User } from '../../entities/user';
import { ServerError } from '../../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export type ExecuteMethod = (
  userID: string,
) => Promise<Either<ThereIsNoEntityWithThisPropError | ServerError, User>>;

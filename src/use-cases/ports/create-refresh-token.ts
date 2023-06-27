import { User } from '../../entities/user';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export type ExecuteMethod = (
  user: User,
) => Promise<Either<ThereIsNoEntityWithThisPropError, string>>;

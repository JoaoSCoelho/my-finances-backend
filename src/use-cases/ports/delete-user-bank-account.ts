import { IBankAccountObject } from '../../entities/ports/bank-account';
import { ServerError } from '../../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export type ExecuteMethod = (
  userId: string,
  id: string,
) => Promise<
  Either<ThereIsNoEntityWithThisPropError | ServerError, IBankAccountObject>
>;

import { InvalidParamError } from '../../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export type ExecuteMethod = (
  token: string,
) => Promise<
  Either<InvalidParamError | ThereIsNoEntityWithThisPropError, void>
>;

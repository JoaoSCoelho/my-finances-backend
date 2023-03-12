import { User } from '../../entities/user';
import { InvalidCredentialsError } from '../../errors/invalid-credentials-error';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export type ExecuteMethod = (
  possiblyEmail: any,
  possiblyPassword: any,
) => Promise<
  Either<
    | ServerError
    | InvalidParamError
    | ThereIsNoEntityWithThisPropError
    | InvalidCredentialsError,
    User
  >
>;

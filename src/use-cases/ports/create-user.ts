import { User } from '../../entities/user';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { ThereIsAlreadyEntityWithThisPropError } from '../../errors/there-is-already-entity-with-this-prop-error';
import { Either } from '../../shared/either';

// Necessary data to create a new user

export interface ICreateUserDTO {
  username: string;
  email: string;
  password: string;
  profileImageURL: string;
}

export type ExecuteMethod = (
  data: Record<keyof ICreateUserDTO, any>,
) => Promise<
  Either<InvalidParamError | ThereIsAlreadyEntityWithThisPropError, User>
>;

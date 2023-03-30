import { BankAccount } from '../../entities/bank-account';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';
import { ICreateBankAccountDTO } from './create-bank-account';

export type ExecuteMethod = (
  id: string,
  userId: string,
  data: Omit<Record<keyof ICreateBankAccountDTO, any>, 'userId'>,
) => Promise<
  Either<
    InvalidParamError | ServerError | ThereIsNoEntityWithThisPropError,
    BankAccount
  >
>;

import { BankAccount } from '../../entities/bank-account';
import { ServerError } from '../../errors/server-error';
import { Either } from '../../shared/either';

export type ExecuteMethod = (
  userID: string,
) => Promise<Either<ServerError, BankAccount[]>>;

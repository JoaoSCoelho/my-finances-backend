import { BankAccount } from '../../entities/bank-account';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export interface ICreateBankAccountDTO {
  name: string;
  amount: number;
  userId: string;
  imageURL?: string;
}

export type ExecuteMethod = (
  data: Record<keyof ICreateBankAccountDTO, any>,
) => Promise<
  Either<InvalidParamError | ThereIsNoEntityWithThisPropError, BankAccount>
>;

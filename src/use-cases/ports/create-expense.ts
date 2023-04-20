import { Expense } from '../../entities/expense';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../../errors/there-is-no-entity-with-this-prop-error';
import { Either } from '../../shared/either';

export interface ICreateExpenseDTO {
  description: string;
  spent: number;
  bankAccountId: string;
}

export type ExecuteMethod = (
  data: Record<keyof ICreateExpenseDTO, any>,
) => Promise<
  Either<InvalidParamError | ThereIsNoEntityWithThisPropError, Expense>
>;

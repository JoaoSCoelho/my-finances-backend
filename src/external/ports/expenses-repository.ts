import { IExpenseObject } from '../../entities/ports/expense';

export type SetMethod = (expense: IExpenseObject) => Promise<IExpenseObject>;

export type ExpensesRepository = {
  set: SetMethod;
};

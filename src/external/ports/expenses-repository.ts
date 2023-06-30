import { IExpenseObject } from '../../entities/expense';

export type SetMethod = (expense: IExpenseObject) => Promise<IExpenseObject>;
export type FilterWithThisPropsMethod = <
  K extends keyof IExpenseObject,
  V extends IExpenseObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<IExpenseObject[]>;

export type ExpensesRepository = {
  set: SetMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
};

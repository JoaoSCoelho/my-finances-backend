import { IExpenseObject } from '../../entities/expense';
import { Either } from '../../shared/either';

export type SetMethod = (expense: IExpenseObject) => Promise<IExpenseObject>;
export type FilterWithThisPropsMethod = <
  K extends keyof IExpenseObject,
  V extends IExpenseObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<IExpenseObject[]>;
export type FindWithThisPropsMethod = <
  K extends keyof IExpenseObject,
  V extends IExpenseObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<Either<null, IExpenseObject>>;
export type UpdateMethod = <
  K extends Exclude<keyof IExpenseObject, 'id'>,
  V extends IExpenseObject[K],
>(
  id: string,
  updateObject: Partial<Record<K, V>>,
) => Promise<Either<null, IExpenseObject>>;
export type DeleteMethod = (id: string) => Promise<void>;

export type ExpensesRepository = {
  set: SetMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
  findWithThisProps: FindWithThisPropsMethod;
  update: UpdateMethod;
  delete: DeleteMethod;
};

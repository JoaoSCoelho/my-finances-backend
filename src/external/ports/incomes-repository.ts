import { IIncomeObject } from '../../entities/income';
import { Either } from '../../shared/either';

export type SetMethod = (income: IIncomeObject) => Promise<IIncomeObject>;
export type FilterWithThisPropsMethod = <
  K extends keyof IIncomeObject,
  V extends IIncomeObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<IIncomeObject[]>;
export type FindWithThisPropsMethod = <
  K extends keyof IIncomeObject,
  V extends IIncomeObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<Either<null, IIncomeObject>>;
export type UpdateMethod = <
  K extends Exclude<keyof IIncomeObject, 'id'>,
  V extends IIncomeObject[K],
>(
  id: string,
  updateObject: Partial<Record<K, V>>,
) => Promise<Either<null, IIncomeObject>>;
export type DeleteMethod = (id: string) => Promise<void>;
export type DeletePropsMethod = <K extends keyof IIncomeObject>(
  id: string,
  propsNames: K[],
) => Promise<Either<null, IIncomeObject>>;
export type BulkDeleteMethod = <
  K extends keyof IIncomeObject,
  V extends IIncomeObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<void>;

export type IncomesRepository = {
  set: SetMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
  findWithThisProps: FindWithThisPropsMethod;
  update: UpdateMethod;
  delete: DeleteMethod;
  bulkDelete: BulkDeleteMethod;
  deleteProps: DeletePropsMethod;
};

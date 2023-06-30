import { IIncomeObject } from '../../entities/income';

export type SetMethod = (income: IIncomeObject) => Promise<IIncomeObject>;
export type FilterWithThisPropsMethod = <
  K extends keyof IIncomeObject,
  V extends IIncomeObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<IIncomeObject[]>;

export type IncomesRepository = {
  set: SetMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
};

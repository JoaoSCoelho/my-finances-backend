import { IBankAccountObject } from '../../entities/ports/bank-account';
import { Either } from '../../shared/either';

export type SetMethod = (
  bankAccount: IBankAccountObject,
) => Promise<IBankAccountObject>;
export type FilterEqualMethod = <
  K extends keyof IBankAccountObject,
  V extends IBankAccountObject[K],
>(
  key: K,
  value: V,
) => Promise<IBankAccountObject[]>;
export type FilterWithThisPropsMethod = <
  K extends keyof IBankAccountObject,
  V extends IBankAccountObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<IBankAccountObject[]>;
export type UpdateMethod = <
  K extends Exclude<keyof IBankAccountObject, 'id'>,
  V extends IBankAccountObject[K],
>(
  id: string,
  updateObject: Partial<Record<K, V>>,
) => Promise<Either<null, IBankAccountObject>>;

export type BankAccountsRepository = {
  set: SetMethod;
  filterEqual: FilterEqualMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
  update: UpdateMethod;
};

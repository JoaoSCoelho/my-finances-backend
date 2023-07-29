import { IBankAccountObject } from '../../entities/bank-account';
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
export type DeleteMethod = (id: string) => Promise<void>;
export type ExistsWithThisIDMethod = (
  bankAccountId: string,
) => Promise<boolean>;
export type ExistsMethod = (
  filter: Partial<IBankAccountObject>,
) => Promise<boolean>;
export type FindWithThisPropsMethod = <
  K extends keyof IBankAccountObject,
  V extends IBankAccountObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<Either<null, IBankAccountObject>>;
export type DeletePropsMethod = <K extends keyof IBankAccountObject>(
  id: string,
  propsNames: K[],
) => Promise<Either<null, IBankAccountObject>>;
export type BulkDeleteMethod = <
  K extends keyof IBankAccountObject,
  V extends IBankAccountObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<void>;

export type BankAccountsRepository = {
  set: SetMethod;
  filterEqual: FilterEqualMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
  update: UpdateMethod;
  delete: DeleteMethod;
  existsWithThisID: ExistsWithThisIDMethod;
  exists: ExistsMethod;
  findWithThisProps: FindWithThisPropsMethod;
  deleteProps: DeletePropsMethod;
  bulkDelete: BulkDeleteMethod;
};

import { IBankAccountObject } from '../../entities/ports/bank-account';

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

export type BankAccountsRepository = {
  set: SetMethod;
  filterEqual: FilterEqualMethod;
};

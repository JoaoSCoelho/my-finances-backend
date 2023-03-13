import { IBankAccountObject } from '../../entities/ports/bank-account';

export type SetMethod = (
  bankAccount: IBankAccountObject,
) => Promise<IBankAccountObject>;

export type BankAccountsRepository = {
  set: SetMethod;
};

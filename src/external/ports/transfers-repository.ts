import { ITransferObject } from '../../entities/transfer';

export type SetMethod = (transfer: ITransferObject) => Promise<ITransferObject>;
export type FilterWithThisPropsMethod = <
  K extends keyof ITransferObject,
  V extends ITransferObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<ITransferObject[]>;

export type TransfersRepository = {
  set: SetMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
};

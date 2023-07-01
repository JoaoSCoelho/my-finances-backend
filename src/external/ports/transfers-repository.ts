import { ITransferObject } from '../../entities/transfer';
import { Either } from '../../shared/either';

export type SetMethod = (transfer: ITransferObject) => Promise<ITransferObject>;
export type FilterWithThisPropsMethod = <
  K extends keyof ITransferObject,
  V extends ITransferObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<ITransferObject[]>;
export type FilterWithThisPossibilitiesMethod = <
  K extends keyof ITransferObject,
  V extends ITransferObject[K],
>(
  filters: Partial<Record<K, V>>[],
) => Promise<ITransferObject[]>;
export type FindWithThisPropsMethod = <
  K extends keyof ITransferObject,
  V extends ITransferObject[K],
>(
  filter: Partial<Record<K, V>>,
) => Promise<Either<null, ITransferObject>>;
export type UpdateMethod = <
  K extends Exclude<keyof ITransferObject, 'id'>,
  V extends ITransferObject[K],
>(
  id: string,
  updateObject: Partial<Record<K, V>>,
) => Promise<Either<null, ITransferObject>>;
export type DeleteMethod = (id: string) => Promise<void>;

export type TransfersRepository = {
  set: SetMethod;
  filterWithThisProps: FilterWithThisPropsMethod;
  filterWithThisPossibilities: FilterWithThisPossibilitiesMethod;
  findWithThisProps: FindWithThisPropsMethod;
  update: UpdateMethod;
  delete: DeleteMethod;
};

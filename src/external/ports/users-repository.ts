import { IUserObject } from '../../entities/ports/user';
import { Either } from '../../shared/either';

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export type ExistsWithThisIDMethod = (userID: string) => Promise<boolean>;
export type ExistsWithThisEmailMethod = (email: string) => Promise<boolean>;
export type SetMethod = (user: IUserObject) => Promise<IUserObject>;
export type UpdatePropMethod = <
  K extends keyof IUserObject,
  V extends IUserObject[K],
>(
  userID: string,
  key: K,
  value: V,
) => Promise<Either<null, IUserObject>>;
export type FilterEqualMethod = <
  K extends keyof IUserObject,
  V extends IUserObject[K],
>(
  key: K,
  value: V,
) => Promise<IUserObject[]>;
export type DeleteMethod = (userID: string) => Promise<void>;
export type GetByIdMethod = (
  userID: string,
) => Promise<Either<null, IUserObject>>;
export type GetByEmailMethod = (
  email: string,
) => Promise<Either<null, IUserObject>>;
export type PushItemToPropMethod = <
  K extends keyof IUserObject,
  A extends IUserObject[K],
>(
  userID: string,
  key: K,
  value: ArrElement<A>,
) => Promise<Either<null, IUserObject>>;

export type UsersRepository = {
  existsWithThisID: ExistsWithThisIDMethod;
  existsWithThisEmail: ExistsWithThisEmailMethod;
  set: SetMethod;
  updateProp: UpdatePropMethod;
  filterEqual: FilterEqualMethod;
  delete: DeleteMethod;
  getById: GetByIdMethod;
  getByEmail: GetByEmailMethod;
  pushItemToProp: PushItemToPropMethod;
};

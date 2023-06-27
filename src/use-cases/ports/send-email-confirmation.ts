import { User } from '../../entities/user';

export type ExecuteMethod = (user: User) => Promise<void>;

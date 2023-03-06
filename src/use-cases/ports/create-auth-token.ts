export interface IAuthToken {
  userID: string;
}

export type ExecuteMethod = (userID: string) => string;

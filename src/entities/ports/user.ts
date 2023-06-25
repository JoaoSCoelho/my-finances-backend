export interface IUserObject {
  id: string;
  username: string;
  email: string;
  hashPassword: string;
  createdTimestamp: number;
  confirmedEmail: boolean;
  refreshTokens: string[];
}

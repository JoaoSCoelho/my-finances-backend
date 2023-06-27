export type GenericPayload = {
  type: 'access' | 'refresh' | 'confirm-email';
  [key: string]: any;
};
export interface IAccessTokenPayload extends GenericPayload {
  userID: string;
  confirmedEmail: boolean;
  type: 'access';
}

export interface IRefreshTokenPayload extends GenericPayload {
  userID: string;
  type: 'refresh';
}

export interface IConfirmEmailPayload extends GenericPayload {
  userID: string;
  type: 'confirm-email';
}

export type GenerateMethod = (
  payload: GenericPayload,
  secret: string,
  expiresIn: number,
) => string;

export type VerifyMethod = (token: string, secret: string) => GenericPayload;

export type TokenManager = {
  generate: GenerateMethod;
  verify: VerifyMethod;
};

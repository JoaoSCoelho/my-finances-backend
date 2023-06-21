export type GenericPayload = {
  type: 'auth' | 'confirm-email';
  [key: string]: any;
};
export interface IAuthTokenPayload extends GenericPayload {
  userID: string;
  type: 'auth';
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

export interface IAuthTokenPayload {
  userID: string;
}

export type GenericPayload = Record<string, any>;

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

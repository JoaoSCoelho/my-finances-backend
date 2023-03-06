export type GenerateMethod = (
  payload: Record<string, any>,
  secret: string,
  expiresIn: number,
) => string;

export type TokenManager = {
  generate: GenerateMethod;
};

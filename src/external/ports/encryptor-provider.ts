export type EncryptMethod = (data: string, salts: number) => string;
export type CompareMethod = (data: string, encrypted: string) => boolean;

export type EncryptorProvider = {
  encrypt: EncryptMethod;
  compare: CompareMethod;
};

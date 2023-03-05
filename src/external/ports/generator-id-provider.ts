export type GenerateMethod = () => string;

export type GeneratorIDProvider = {
  generate: GenerateMethod;
};

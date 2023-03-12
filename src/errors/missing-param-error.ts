export class MissingParamError extends Error {
  public readonly code = 103;
  public readonly name = 'Missing param';
  public readonly error: string;

  constructor(public readonly paramName: string) {
    const message = `Missing param: ${paramName}`;

    super(message);

    this.error = message;
  }
}

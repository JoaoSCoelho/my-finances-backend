export type InvalidParamReasons =
  | 'invalid'
  | 'invalid child'
  | 'type not supported'
  | 'missing props'
  | 'unwanted props'
  | 'expired'
  | 'incorrect structure'
  | 'invalid characters'
  | 'less than the minimum characters'
  | 'less than the minimum'
  | 'greater than maximum characters'
  | 'greater than maximum'
  | 'reserved'
  | 'very large'
  | 'already exists'
  | 'equal to old prop'
  | 'is not a safe number';

export class InvalidParamError extends Error {
  public readonly code = 100;
  public readonly name = 'Invalid param';
  public readonly error: string;

  constructor(
    public readonly paramName: string,
    public readonly param: any,
    public readonly reason: InvalidParamReasons,
    public readonly expected: string,
  ) {
    const message = `The ${paramName} "${param}" is invalid: ${reason}. Expected: ${expected}`;

    super(message);

    this.error = message;
  }
}

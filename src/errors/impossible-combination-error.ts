export class ImpossibleCombinationError extends Error {
  public readonly code = 107;
  public readonly name = 'Impossible combination';
  public readonly error: string;

  constructor(public readonly param1: string, public readonly param2: string) {
    const message = `Unable to combine "${param1}" with "${param2}"`;

    super(message);

    this.error = message;
  }
}

export class ThereIsAlreadyEntityWithThisPropError extends Error {
  public readonly code = 101;
  public readonly name = 'There is already entity with this prop';
  public readonly error: string;

  constructor(
    public readonly entityName: string,
    public readonly propName: string,
    public readonly prop: any,
  ) {
    const message = `There is already ${entityName} document with this ${propName}: ${prop}`;

    super(message);

    this.error = message;
  }
}

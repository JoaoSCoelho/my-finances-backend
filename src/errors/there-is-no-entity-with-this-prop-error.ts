export class ThereIsNoEntityWithThisPropError extends Error {
  public readonly code = 104;
  public readonly name = 'There is no entity with this prop';
  public readonly error: string;

  constructor(
    public readonly entityName: string,
    public readonly propName: string,
    public readonly prop: any,
  ) {
    const message = `There is no ${entityName} document with this ${propName}: ${prop}`;

    super(message);

    this.error = message;
  }
}

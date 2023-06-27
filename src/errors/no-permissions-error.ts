export class NoPermissionsError extends Error {
  public readonly code = 106;
  public readonly name = 'No permissions';
  public readonly error: string;

  constructor(public readonly permissions: string | string[]) {
    const message = `No permissions: ${permissions}`;

    super(message);

    this.error = message;
  }
}

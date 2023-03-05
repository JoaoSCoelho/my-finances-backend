export type IServerErrorReasons = 'internal';

export class ServerError extends Error {
  public readonly code = 102;
  public readonly name = 'Server error';
  public readonly error: string;

  constructor(public readonly reason: IServerErrorReasons = 'internal') {
    const message = `Server error ${reason}`;

    super(message);

    this.error = 'Server error: ' + reason;
  }
}

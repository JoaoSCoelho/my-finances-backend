import {
  InvalidParamError,
  InvalidParamReasons,
} from '../errors/invalid-param-error';
import { Either, left, right } from '../shared/either';

export class URL {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static type = 'string';
  static maximumLength = 32768;
  static structure = () => /^((http)|(https)):\/\/.+\..+(\/.+)?$/gi;

  static create(url: any): Either<InvalidParamError, URL> {
    const genError = (reason: InvalidParamReasons, expected: string) =>
      new InvalidParamError('url', url, reason, expected);

    if (typeof url !== this.type)
      return left(genError('type not supported', this.type));
    if (url.length > this.maximumLength)
      return left(
        genError(
          'greater than the maximum characters',
          `Less or equal than ${this.maximumLength} characters`,
        ),
      );
    if (!this.structure().test(url))
      return left(genError('incorrect structure', 'A valid web URL'));

    return right(new URL(url));
  }
}

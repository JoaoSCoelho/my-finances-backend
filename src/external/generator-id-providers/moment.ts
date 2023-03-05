import { GeneratorIDProvider } from '../ports/generator-id-provider';

export class Moment implements GeneratorIDProvider {
  generate = () => {
    const instant = new Date();
    const hrTime = process.hrtime();
    const hrTimeNanoString = `${hrTime[1]}`;
    const nanoSliced = hrTimeNanoString.slice(0, hrTimeNanoString.length - 2);

    const year = instant.getUTCFullYear();
    const month = `${instant.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${instant.getUTCDate()}`.padStart(2, '0');
    const hours = `${instant.getUTCHours()}`.padStart(2, '0');
    const minutes = `${instant.getUTCMinutes()}`.padStart(2, '0');
    const seconds = `${instant.getUTCSeconds()}`.padStart(2, '0');
    const milliseconds = `${instant.getUTCMilliseconds()}`.padStart(3, '0');
    const nanoseconds =
      nanoSliced.length - 4 < 0
        ? nanoSliced.padStart(4, '0')
        : nanoSliced.slice(nanoSliced.length - 4);

    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${nanoseconds}`;
  };
}

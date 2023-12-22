/**
 * Return array of numbers inclusive of start and stop
 * @param start
 * @param stop
 * @param step
 */
export const arrayRange = (start: number, stop: number, step: number = 1) : number[] =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (_, index) => start + index * step
  );

// Array.from(new Array(20), (x, i) => i + *lowerBound*);

export const arrayDifference = (a: number[], b: number[]): number[] =>
   a.filter(x => !b.includes(x));

export const arrayUnion3 = (a: number[], b: number[], c: number[]): number[] =>
    [...new Set([...a, ...b, ...c])];

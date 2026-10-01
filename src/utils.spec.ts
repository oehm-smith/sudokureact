// ABOUTME: Tests for the array helpers the board logic is built on.
// ABOUTME: Assertions use Jest's own expect.

import { arrayDifference, arrayRange, arrayUnion3 } from './utils';

describe('utils', () => {
    describe('arrayRange', () => {
        it('is inclusive of both ends', () => {
            expect(arrayRange(0, 9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });

        it('honours a step', () => {
            expect(arrayRange(0, 9, 2)).toEqual([0, 2, 4, 6, 8]);
        });

        it('returns a single element when start and stop match', () => {
            expect(arrayRange(4, 4)).toEqual([4]);
        });
    });

    describe('arrayDifference', () => {
        it('removes the members of the second array', () => {
            expect(arrayDifference([1, 2, 3], [2])).toEqual([1, 3]);
        });

        it('returns the first array when there is nothing to remove', () => {
            expect(arrayDifference([1, 2, 3], [])).toEqual([1, 2, 3]);
        });

        it('returns nothing when everything is removed', () => {
            expect(arrayDifference([1, 2, 3], [1, 2, 3])).toEqual([]);
        });

        it('ignores members of the second array that are not in the first', () => {
            expect(arrayDifference([1, 2, 3], [4, 5])).toEqual([1, 2, 3]);
        });
    });

    describe('arrayUnion3', () => {
        it('combines three arrays', () => {
            expect(arrayUnion3([1, 2, 3], [4], [])).toEqual([1, 2, 3, 4]);
            expect(arrayUnion3([1, 2, 3], [], [4])).toEqual([1, 2, 3, 4]);
        });

        it('de-duplicates across the three', () => {
            expect(arrayUnion3([1, 2, 3], [1, 2, 3], [4])).toEqual([1, 2, 3, 4]);
            expect(arrayUnion3([1, 2, 3], [1, 2, 3, 4], [4])).toEqual([1, 2, 3, 4]);
            expect(arrayUnion3([1, 2, 3], [1, 2, 3, 4], [5])).toEqual([1, 2, 3, 4, 5]);
        });

        it('de-duplicates within a single array', () => {
            expect(arrayUnion3([1, 1, 1], [], [])).toEqual([1]);
        });
    });
});

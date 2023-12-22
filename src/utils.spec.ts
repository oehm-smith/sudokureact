import { expect } from 'chai';
import { arrayDifference, arrayRange, arrayUnion3 } from './utils';

describe('utils', () => {
    describe('array range', () => {
        it('basic', () => {
            expect(arrayRange(0, 9)).to.have.members([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });

        it('with step', () => {
            expect(arrayRange(0, 9, 2)).to.have.members([0, 2, 4, 6, 8]);
        });
    });

    describe('arrayDifference', () => {
        it('all tests', () => {
            expect(arrayDifference([1, 2, 3], [2])).to.have.members([1, 3]);
            expect(arrayDifference([1, 2, 3], [])).to.have.members([1, 2, 3]);
            expect(arrayDifference([1, 2, 3], [1, 2, 3])).to.have.members([]);
        });
    });

    describe('arrayUnion3', () => {
        it('all tests', () => {
            expect(arrayUnion3([1, 2, 3], [4], [])).to.have.members([1, 2, 3, 4]);
            expect(arrayUnion3([1, 2, 3], [], [4])).to.have.members([1, 2, 3, 4]);
            expect(arrayUnion3([1, 2, 3], [1, 2, 3], [4])).to.have.members([1, 2, 3, 4]);
            expect(arrayUnion3([1, 2, 3], [1, 2, 3, 4], [4])).to.have.members([1, 2, 3, 4]);
            expect(arrayUnion3([1, 2, 3], [1, 2, 3, 4], [5])).to.have.members([1, 2, 3, 4, 5]);
        })
    });
});

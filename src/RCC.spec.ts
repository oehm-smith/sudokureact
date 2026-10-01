// ABOUTME: Tests for RCC, one region (row, column or cell) of the board.
// ABOUTME: Covers membership, used values and the live view onto the board array.

import Point from './Point';
import RCC from './RCC';

/** A 9x9 board whose squares each hold their own 0-based index, for easy identification. */
const indexedBoard = (): number[] => Array.from({length: 81}, (_, index) => index);

describe('RCC', () => {
    describe('isIn', () => {
        const cell = new RCC(indexedBoard(), new Point(4, 4), new Point(6, 6), 9);

        it('accepts a square inside the region', () => {
            expect(cell.isIn(5, 5)).toBe(true);
        });

        it('accepts the corners', () => {
            expect(cell.isIn(4, 4)).toBe(true);
            expect(cell.isIn(6, 6)).toBe(true);
        });

        it('rejects a square outside the region', () => {
            expect(cell.isIn(3, 5)).toBe(false);
            expect(cell.isIn(5, 7)).toBe(false);
        });
    });

    describe('usedValues', () => {
        it('reads a row out of the board array', () => {
            // Row 2 is indexes 9..17, which hold those same values.
            const row = new RCC(indexedBoard(), new Point(1, 2), new Point(9, 2), 9);

            expect(row.usedValues()).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
        });

        it('reads a column out of the board array', () => {
            const col = new RCC(indexedBoard(), new Point(2, 1), new Point(2, 9), 9);

            expect(col.usedValues()).toEqual([1, 10, 19, 28, 37, 46, 55, 64, 73]);
        });

        it('reads a three-by-three cell out of the board array', () => {
            const cell = new RCC(indexedBoard(), new Point(1, 1), new Point(3, 3), 9);

            // Index 0 holds the value 0, which is a blank, so it is left out.
            expect(cell.usedValues()).toEqual([1, 2, 9, 10, 11, 18, 19, 20]);
        });

        it('omits blanks, which are 0', () => {
            const board = new Array(81).fill(0);
            board[0] = 5;
            board[8] = 3;
            const row = new RCC(board, new Point(1, 1), new Point(9, 1), 9);

            expect(row.usedValues()).toEqual([3, 5]);
        });

        it('sorts numerically rather than lexicographically', () => {
            // A default sort puts 10 before 2. The region is sized for a 16-wide board.
            const board = new Array(256).fill(0);
            [2, 10, 1, 16].forEach((value, position) => {
                board[position] = value;
            });
            const row = new RCC(board, new Point(1, 1), new Point(16, 1), 16);

            expect(row.usedValues()).toEqual([1, 2, 10, 16]);
        });

        it('reports duplicates, because it counts occupancy rather than a set', () => {
            const board = new Array(81).fill(0);
            board[0] = 4;
            board[1] = 4;
            const row = new RCC(board, new Point(1, 1), new Point(9, 1), 9);

            expect(row.usedValues()).toEqual([4, 4]);
        });

        it('sees changes made to the board array after construction', () => {
            const board = new Array(81).fill(0);
            const row = new RCC(board, new Point(1, 1), new Point(9, 1), 9);

            expect(row.usedValues()).toEqual([]);
            board[4] = 7;
            expect(row.usedValues()).toEqual([7]);
        });
    });

    it('exposes its corners', () => {
        const cell = new RCC(indexedBoard(), new Point(4, 4), new Point(6, 6), 9);

        expect(cell.topLeft).toEqual(new Point(4, 4));
        expect(cell.bottomRight).toEqual(new Point(6, 6));
    });

    describe('getRCCDebug', () => {
        it('names its corners', () => {
            const cell = new RCC(indexedBoard(), new Point(4, 4), new Point(6, 6), 9);

            expect(cell.getRCCDebug()).toBe('RCC - [4,4] -> [6,6]');
        });

        it('appends the board when asked', () => {
            const cell = new RCC(indexedBoard(), new Point(4, 4), new Point(6, 6), 9);

            expect(cell.getRCCDebug(true)).toContain('board:');
        });
    });
});

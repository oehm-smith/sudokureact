// ABOUTME: Tests for the Sudoku board — coordinate mapping, region lookup and legal moves.
// ABOUTME: This logic was previously untested; the cases came across from the oehmsmith.com port.

import Board from './Board';
import Point from './Point';

/** An empty 9x9 board, so a square's legal moves are unconstrained. */
const emptyBoard = (): Board => new Board(9, new Array(81).fill(0));

/**
 * A board whose first row is 1..9 and whose first column is 1..9.
 *
 * Square [2,2] is blank. Its row contributes 2, its column contributes 2, and
 * its top-left cell contributes 1,2,3 — so 1,2,3 are spoken for.
 */
const seededBoard = (): Board => {
    const values = new Array(81).fill(0);
    for (let i = 0; i < 9; i += 1) {
        values[i] = i + 1;      // first row
        values[i * 9] = i + 1;  // first column
    }
    return new Board(9, values);
};

describe('construction', () => {
    it('loads every value', () => {
        const board = seededBoard();

        expect(board.board).toHaveLength(81);
        expect(board.board[0]).toBe(1);
        expect(board.board[8]).toBe(9);
    });

    it('reports its size', () => {
        expect(emptyBoard().size).toBe(9);
    });

    it('marks pre-filled squares as static and blanks as editable', () => {
        const board = seededBoard();

        expect(board.staticEntries[0]).toBe(true);
        expect(board.staticEntries[10]).toBe(false);
    });

    it('treats an empty board as entirely editable', () => {
        const board = emptyBoard();

        expect(board.staticEntries.every((isStatic) => isStatic === false)).toBe(true);
    });

    it('rejects more values than the board can hold', () => {
        expect(() => new Board(9, new Array(82).fill(0)))
            .toThrow(/attempting to add more than boardSize/);
    });
});

describe('indexToPoint', () => {
    it('maps the first square to the 1-indexed origin', () => {
        expect(emptyBoard().indexToPoint(0)).toEqual(new Point(1, 1));
    });

    it('maps the end of the first row', () => {
        expect(emptyBoard().indexToPoint(8)).toEqual(new Point(9, 1));
    });

    it('wraps to the next row', () => {
        expect(emptyBoard().indexToPoint(9)).toEqual(new Point(1, 2));
    });

    it('maps the last square', () => {
        expect(emptyBoard().indexToPoint(80)).toEqual(new Point(9, 9));
    });

    it('round-trips every index back to itself', () => {
        const board = emptyBoard();

        for (let index = 0; index < 81; index += 1) {
            const point = board.indexToPoint(index);
            expect((point.y - 1) * 9 + (point.x - 1)).toBe(index);
        }
    });
});

describe('region lookup', () => {
    it('returns the row containing a square', () => {
        const board = seededBoard();

        // Row 1 is fully populated with 1..9.
        expect(board.getRow(new Point(5, 1)).usedValues()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('returns the column containing a square', () => {
        const board = seededBoard();

        expect(board.getCol(new Point(1, 5)).usedValues()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('returns the three-by-three cell containing a square', () => {
        const board = seededBoard();

        // The top-left cell holds row 1's 1,2,3 and column 1's 2,3 — duplicates
        // included, because usedValues reports occupancy rather than a set.
        expect(board.getCell(new Point(2, 2)).usedValues()).toEqual([1, 2, 2, 3, 3]);
    });

    it('puts squares in the same cell together and keeps neighbours apart', () => {
        const board = emptyBoard();
        const topLeft = board.getCell(new Point(1, 1));

        expect(board.getCell(new Point(3, 3))).toBe(topLeft);
        // One column over is the middle cell, not the top-left one.
        expect(board.getCell(new Point(4, 3))).not.toBe(topLeft);
    });

    it('assigns every square to exactly one of the nine cells', () => {
        const board = emptyBoard();
        const cells = new Set<unknown>();

        for (let index = 0; index < 81; index += 1) {
            cells.add(board.getCell(board.indexToPoint(index)));
        }

        expect(cells.size).toBe(9);
    });
});

describe('getPossibleValues', () => {
    it('offers every value on an empty board', async () => {
        const board = emptyBoard();

        await expect(board.getPossibleValues(new Point(1, 1))).resolves.toEqual([
            1, 2, 3, 4, 5, 6, 7, 8, 9,
        ]);
    });

    it('excludes values already used in the row, column or cell', async () => {
        const board = seededBoard();

        // The union of what [2,2] can see is 1,2,3, leaving 4..9.
        await expect(board.getPossibleValues(new Point(2, 2))).resolves.toEqual([
            4, 5, 6, 7, 8, 9,
        ]);
    });

    it('offers nothing when every value is taken', async () => {
        const values = new Array(81).fill(0);
        for (let i = 0; i < 9; i += 1) {
            values[i] = i + 1;
        }
        const board = new Board(9, values);

        // Every value appears in this square's own row.
        await expect(board.getPossibleValues(new Point(1, 1))).resolves.toEqual([]);
    });

    it('agrees with the index-based lookup', async () => {
        const board = seededBoard();

        const byPoint = await board.getPossibleValues(new Point(2, 2));
        const byIndex = await board.getPossibleValuesByIndex(10);

        expect(byIndex).toEqual(byPoint);
    });

    it('reflects a value written to the board after construction', async () => {
        const board = emptyBoard();

        await expect(board.getPossibleValuesByIndex(1)).resolves.toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        board.board[0] = 4;
        await expect(board.getPossibleValuesByIndex(1)).resolves.toEqual([1, 2, 3, 5, 6, 7, 8, 9]);
    });

    it('never offers a value that breaks the Sudoku invariant', async () => {
        const board = seededBoard();

        for (let index = 0; index < 81; index += 1) {
            if (board.board[index] !== 0) continue;

            const point = board.indexToPoint(index);
            const possible = await board.getPossibleValuesByIndex(index);
            const used = new Set([
                ...board.getRow(point).usedValues(),
                ...board.getCol(point).usedValues(),
                ...board.getCell(point).usedValues(),
            ]);

            for (const value of possible) {
                expect(used.has(value)).toBe(false);
            }
        }
    });
});

describe('getBoardDebug', () => {
    it('draws one line per row with the cell boundaries marked', () => {
        const debug = emptyBoard().getBoardDebug();

        expect(debug).toContain('|000|000|000|');
        expect(debug.split('\n').filter((line) => line.startsWith('|'))).toHaveLength(9);
    });
});

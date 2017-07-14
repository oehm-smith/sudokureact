import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import Board from "./Board";
import {Point} from "./Point";
import {RCC, RCCType} from "./RCC";

describe('test App', () => {
    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<App />, div);
    });

    let exampleBoard1Size = 9;
    let exampleBoard1 = function exampleBoard1(): number[] {
        return [0, 0, 0, 1, 0, 5, 0, 6, 8,
            0, 0, 0, 0, 0, 0, 7, 0, 1,
            9, 0, 1, 0, 0, 0, 0, 3, 0,
            0, 0, 7, 0, 2, 6, 0, 0, 0,
            5, 0, 0, 0, 0, 0, 0, 0, 3,
            0, 0, 0, 8, 7, 0, 4, 0, 0,
            0, 3, 0, 0, 0, 0, 8, 0, 5,
            1, 0, 5, 0, 0, 0, 0, 0, 0,
            7, 9, 0, 4, 0, 1, 0, 0, 0];
    };

    describe('test Board - get col, rows, cell', () => {
        let board: Board;

        let expectRCCValues = function (which: RCCType, entry: Point, expectedValues: number[], board: Board) {
            let theRCC: RCC;

            switch (which) {
                case RCCType.cell:
                    theRCC = board.getCell(entry);
                    break;
                case RCCType.col:
                    theRCC = board.getCol(entry);
                    break;
                case RCCType.row:
                    theRCC = board.getRow(entry);
                    break;
                default:
                    // Satisfy static analysis.  This will never be reached.
                    theRCC = new RCC([], new Point(0, 0), new Point(0, 0));
            }
            expect(theRCC.isIn).toBeDefined();  // It is an RCC

            expect(theRCC.usedValues().length).toBe(expectedValues.length);
            expectedValues.forEach((value) => {
                expect(theRCC.usedValues()).toContain(value);
            });
        };

        beforeEach(() => {
            board = new Board(exampleBoard1Size, exampleBoard1());
        });

        it('RCC is defined as expected for rows', () => {
            expectRCCValues(RCCType.row, new Point(1, 1), [1, 5, 6, 8], board);
            expectRCCValues(RCCType.row, new Point(1, 2), [7, 1], board);
            expectRCCValues(RCCType.row, new Point(1, 3), [9, 1, 3], board);
            expectRCCValues(RCCType.row, new Point(1, 4), [7, 2, 6], board);
            expectRCCValues(RCCType.row, new Point(1, 5), [5, 3], board);
            expectRCCValues(RCCType.row, new Point(1, 6), [8, 7, 4], board);
            expectRCCValues(RCCType.row, new Point(1, 7), [3, 5, 8], board);
            expectRCCValues(RCCType.row, new Point(1, 8), [1, 5], board);
            expectRCCValues(RCCType.row, new Point(1, 9), [7, 9, 4, 1], board);
        });

        it('RCC is defined as expected for cols', () => {
            expectRCCValues(RCCType.col, new Point(1, 1), [9, 1, 5, 7], board);
            expectRCCValues(RCCType.col, new Point(2, 1), [3, 9], board);
            expectRCCValues(RCCType.col, new Point(3, 1), [1, 7, 5], board);
            expectRCCValues(RCCType.col, new Point(4, 1), [1, 8, 4], board);
            expectRCCValues(RCCType.col, new Point(5, 1), [2, 7], board);
            expectRCCValues(RCCType.col, new Point(6, 1), [5, 6, 1], board);
            expectRCCValues(RCCType.col, new Point(7, 1), [7, 4, 8], board);
            expectRCCValues(RCCType.col, new Point(8, 1), [6, 3], board);
            expectRCCValues(RCCType.col, new Point(9, 1), [8, 1, 3, 5], board);
        });

        it('RCC is defined as expected for cells', () => {
            // Each new point is an entry in the desired cell
            expectRCCValues(RCCType.cell, new Point(1, 1), [9, 1], board);
            expectRCCValues(RCCType.cell, new Point(4, 1), [1, 5], board);
            expectRCCValues(RCCType.cell, new Point(7, 1), [6, 8, 7, 1, 3], board);
            expectRCCValues(RCCType.cell, new Point(1, 4), [7, 5], board);
            expectRCCValues(RCCType.cell, new Point(4, 4), [2, 6, 8, 7], board);
            expectRCCValues(RCCType.cell, new Point(7, 4), [3, 4], board);
            expectRCCValues(RCCType.cell, new Point(1, 7), [3, 5, 1, 7, 9], board);
            expectRCCValues(RCCType.cell, new Point(4, 7), [1, 4], board);
            expectRCCValues(RCCType.cell, new Point(7, 7), [8, 5], board);
        });
    });

    describe('test Board - get possible values for an entry', () => {
        // Used https://codepen.io/bbos/pen/yXQmjG?editors=1011 to help write tests
        let board: Board;

        let expectEntryPossibleValues = function (entry: number[], expectedValues: number[], board: Board) {
            let possibleValues: number[] = board.getPossibleValues(new Point(entry[0], entry[1]));
            possibleValues.forEach((value) => {
                expect(expectedValues).toContain(value);
            });
        }

        beforeEach(() => {
            board = new Board(exampleBoard1Size, exampleBoard1());
        });

        it('test expected for row 1', () => {
            expectEntryPossibleValues([1, 1], [2, 3, 4], board);
            expectEntryPossibleValues([2, 1], [2, 7, 4], board);
            expectEntryPossibleValues([3, 1], [2, 3, 4], board);
            expectEntryPossibleValues([4, 1], [2, 3, 7, 9], board);
            expectEntryPossibleValues([5, 1], [3, 4, 9], board);
            expectEntryPossibleValues([6, 1], [2, 3, 4, 7, 9], board);
            expectEntryPossibleValues([7, 1], [2, 9], board);
            expectEntryPossibleValues([8, 1], [2, 4, 9], board);
            expectEntryPossibleValues([9, 1], [2, 4, 9], board);
        });
        it('test expected for row 2', () => {
            expectEntryPossibleValues([1, 2], [2, 3, 4, 6, 8], board);
            expectEntryPossibleValues([2, 2], [2, 4, 5, 6, 8], board);
            expectEntryPossibleValues([3, 2], [2, 3, 4, 6, 8], board);
            expectEntryPossibleValues([4, 2], [2, 3, 6, 9], board);
            expectEntryPossibleValues([5, 2], [3, 4, 6, 8, 9], board);
            expectEntryPossibleValues([6, 2], [2, 3, 4, 8, 9], board);
            expectEntryPossibleValues([7, 2], [2, 5, 9], board);
            expectEntryPossibleValues([8, 2], [2, 4, 5, 9], board);
            expectEntryPossibleValues([9, 2], [2, 4, 9], board);
        });
        it('test expected for row 3', () => {
            expectEntryPossibleValues([1, 3], [2, 4, 6, 8], board);
            expectEntryPossibleValues([2, 3], [2, 4, 5, 6, 7, 8], board);
            expectEntryPossibleValues([3, 3], [2, 4, 6, 8], board);
            expectEntryPossibleValues([4, 3], [2, 6, 7], board);
            expectEntryPossibleValues([5, 3], [4, 6, 8], board);
            expectEntryPossibleValues([6, 3], [2, 4, 7, 8], board);
            expectEntryPossibleValues([7, 3], [2, 5], board);
            expectEntryPossibleValues([8, 3], [2, 4, 5], board);
            expectEntryPossibleValues([9, 3], [2, 4], board);
        });
        it('test expected for row 4', () => {
            expectEntryPossibleValues([1, 4], [3, 4, 8], board);
            expectEntryPossibleValues([2, 4], [1, 4, 8], board);
            expectEntryPossibleValues([3, 4], [3, 4, 8, 9], board);
            expectEntryPossibleValues([4, 4], [3, 5, 9], board);
            expectEntryPossibleValues([5, 4], [1, 3, 4, 5, 9], board);
            expectEntryPossibleValues([6, 4], [3, 4, 9], board);
            expectEntryPossibleValues([7, 4], [1, 5, 9], board);
            expectEntryPossibleValues([8, 4], [1, 5, 8, 9], board);
            expectEntryPossibleValues([9, 4], [9], board);
        });
        it('test expected for row 5', () => {
            expectEntryPossibleValues([1, 5], [2, 4, 6,8], board);
            expectEntryPossibleValues([2, 5], [1, 2,4, 6,8], board);
            expectEntryPossibleValues([3, 5], [2, 4, 6,8, 9], board);
            expectEntryPossibleValues([4, 5], [9], board);
            expectEntryPossibleValues([5, 5], [1,  4, 9], board);
            expectEntryPossibleValues([6, 5], [4, 9], board);
            expectEntryPossibleValues([7, 5], [1, 2,6, 9], board);
            expectEntryPossibleValues([8, 5], [1, 2,7, 8, 9], board);
            expectEntryPossibleValues([9, 5], [2,6,7,9], board);
        });
        it('test expected for row 6', () => {
            expectEntryPossibleValues([1, 6], [2, 3, 6], board);
            expectEntryPossibleValues([2, 6], [1, 2, 6], board);
            expectEntryPossibleValues([3, 6], [2, 3, 6, 9], board);
            expectEntryPossibleValues([4, 6], [3,5,9], board);
            expectEntryPossibleValues([5, 6], [1,  3,5, 9], board);
            expectEntryPossibleValues([6, 6], [3, 9], board);
            expectEntryPossibleValues([7, 6], [1, 2,5,6, 9], board);
            expectEntryPossibleValues([8, 6], [1, 2,5, 9], board);
            expectEntryPossibleValues([9, 6], [2,6,9], board);
        });
        it('test expected for row 7', () => {
            expectEntryPossibleValues([1, 7], [2, 4, 6], board);
            expectEntryPossibleValues([2, 7], [2,4, 6], board);
            expectEntryPossibleValues([3, 7], [2,4, 6], board);
            expectEntryPossibleValues([4, 7], [2,6,7,9], board);
            expectEntryPossibleValues([5, 7], [6, 9], board);
            expectEntryPossibleValues([6, 7], [2,7, 9], board);
            expectEntryPossibleValues([7, 7], [1, 2,6, 9], board);
            expectEntryPossibleValues([8, 7], [1, 2,4,7, 9], board);
            expectEntryPossibleValues([9, 7], [2,4,6,7,9], board);
        });
        it('test expected for row 8', () => {
            expectEntryPossibleValues([1, 8], [2, 4, 6,8], board);
            expectEntryPossibleValues([2, 8], [2,4, 6,8], board);
            expectEntryPossibleValues([3, 8], [2,4, 6,8], board);
            expectEntryPossibleValues([4, 8], [2,3,6,7,9], board);
            expectEntryPossibleValues([5, 8], [3,6,8, 9], board);
            expectEntryPossibleValues([6, 8], [2,3,7,8, 9], board);
            expectEntryPossibleValues([7, 8], [2,3,6, 9], board);
            expectEntryPossibleValues([8, 8], [2,4,7, 9], board);
            expectEntryPossibleValues([9, 8], [2,4,6,7,9], board);
        });
        it('test expected for row 9', () => {
            expectEntryPossibleValues([1, 9], [2, 6,8], board);
            expectEntryPossibleValues([2, 9], [2, 6,8], board);
            expectEntryPossibleValues([3, 9], [2, 6,8], board);
            expectEntryPossibleValues([4, 9], [2,3,5,6], board);
            expectEntryPossibleValues([5, 9], [3,5,6,8], board);
            expectEntryPossibleValues([6, 9], [2,3,8], board);
            expectEntryPossibleValues([7, 9], [2,3,6], board);
            expectEntryPossibleValues([8, 9], [2], board);
            expectEntryPossibleValues([9, 9], [2,6], board);
        });
    });

    describe('test function indexToPoint', () => {
        let board: Board;

        beforeEach(() => {
            board = new Board(exampleBoard1Size, exampleBoard1());
        });

        fit('test some of 81 index values', () => {
            expect(board.indexToPoint(0)).toEqual(new Point(1,1));
            expect(board.indexToPoint(8)).toEqual(new Point(9,1));
            expect(board.indexToPoint(9)).toEqual(new Point(1,2));
            expect(board.indexToPoint(10)).toEqual(new Point(2,2));

            expect(board.indexToPoint(20)).toEqual(new Point(3,3));
            expect(board.indexToPoint(25)).toEqual(new Point(8,3));
            expect(board.indexToPoint(30)).toEqual(new Point(4,4));
            expect(board.indexToPoint(35)).toEqual(new Point(9,4));
            expect(board.indexToPoint(36)).toEqual(new Point(1,5));

            expect(board.indexToPoint(79)).toEqual(new Point(8,9));
            expect(board.indexToPoint(80)).toEqual(new Point(9,9));
        });
    });
});

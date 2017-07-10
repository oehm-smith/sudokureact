import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App, {Board, Point, RCC} from './App';

enum RCCType {'row', 'col', 'cell'}
;

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

    let expectValues = function (which: RCCType, num: number, expectedValues: number[], board: Board) {
        let theRCC: RCC;

        switch(which) {
            case RCCType.cell:
                theRCC = board.getCell(num);
                break;
            case RCCType.col:
                theRCC = board.getCol(num);
                break;
            case RCCType.row:
                theRCC = board.getRow(num);
                break;
            default:
                // Satisfy static analysis.  This will never be reached.
                theRCC = new RCC([],new Point(0,0),new Point(0,0));
        }
        expect(theRCC.isIn).toBeDefined();  // It is an RCC

        expect(theRCC.usedValues().length).toBe(expectedValues.length);
        expectedValues.forEach((value) => {
            expect(theRCC.usedValues()).toContain(value);
        });
    };

    describe('test Board - get col, rows, cell', () => {
        let board: Board;

        beforeEach(() => {
            board = new Board(exampleBoard1Size, exampleBoard1());
        });

        it('RCC is defined as expected for rows', () => {
            expectValues(RCCType.row, 1, [1, 5, 6, 8], board);
            expectValues(RCCType.row, 2, [7, 1], board);
            expectValues(RCCType.row, 3, [9, 1, 3], board);
            expectValues(RCCType.row, 4, [7, 2, 6], board);
            expectValues(RCCType.row, 5, [5, 3], board);
            expectValues(RCCType.row, 6, [8, 7, 4], board);
            expectValues(RCCType.row, 7, [3, 5, 8], board);
            expectValues(RCCType.row, 8, [1, 5], board);
            expectValues(RCCType.row, 9, [7, 9, 4, 1], board);
        });

        it('RCC is defined as expected for cols', () => {
            expectValues(RCCType.col, 1, [9, 1, 5, 7], board);
            expectValues(RCCType.col, 2, [3, 9], board);
            expectValues(RCCType.col, 3, [1, 7, 5], board);
            expectValues(RCCType.col, 4, [1, 8, 4], board);
            expectValues(RCCType.col, 5, [2, 7], board);
            expectValues(RCCType.col, 6, [5, 6, 1], board);
            expectValues(RCCType.col, 7, [7,4, 8], board);
            expectValues(RCCType.col, 8, [6,3], board);
            expectValues(RCCType.col, 9, [8,1,3,5], board);
        });

        it('RCC is defined as expected for cells', () => {
            expectValues(RCCType.cell, 1, [9,1], board);
            expectValues(RCCType.cell, 2, [1,5], board);
            expectValues(RCCType.cell, 3, [6,8,7,1,3], board);
            expectValues(RCCType.cell, 4, [7,5], board);
            expectValues(RCCType.cell, 5, [2,6,8,7], board);
            expectValues(RCCType.cell, 6, [3,4], board);
            expectValues(RCCType.cell, 7, [3,5,1,7,9], board);
            expectValues(RCCType.cell, 8, [1,4], board);
            expectValues(RCCType.cell, 9, [8,5], board);
        });
    });
});

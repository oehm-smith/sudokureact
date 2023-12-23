import { ChangeEvent, useState } from 'react';
import './App.css';
import Footer from './Footer';
import Sudoku, { SudokuOptions } from './Sudoku';

// logo CC from https://commons.wikimedia.org/wiki/File:Sudoku-by-L2G-20050714.svg
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const logo = require('./Sudoku-by-L2G-20050714.svg');
import logo from './Sudoku-by-L2G-20050714.svg';

/**
 * Sudoku - the game typically on a 9x9 board that is broken down into 9 rows, 9 cols and 9 cells of 9 entries.  And
 * the possible values are 1..9.
 *
 * Invariant:  That no row, col or cell has more than one of any value
 *
 * Glossary:
 * - Column - across (L to R) the board (table) - there are Board.rccSize of them (eg. 9) - numbered left to right
 * - Row - down (Top to Bottom) the board (table) - there are Board.rccSize of them (eg. 9) - numbered top to bottom
 * - Cell - squares in the board containing Board.rccSize entries - there are Board.rccSize of them (eg. 9) - numbered
 * L to R, Top to Bottom
 * - Entries - the unit squares that can contain a value - there are Board.rccSize of them
 * Entries are at Points on the Board / table / matrix - [col,row]
 * - Value - the contents of each Entry ie 1..9
 */

interface AppState {
    options: SudokuOptions;
}

function App(props: AppState)  {
    const [state, setState] = useState( {options: {showHints: true}});

    const handleOptionsChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = name === 'showHints' ? event.target.checked : event.target.value;
        const appStateOptions: AppState = {options: {showHints: value as boolean}};

        setState(appStateOptions);
    }

    return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>Welcome to Sudoku</h2>
                </div>
                <div className="body">
                    <div className="board"><Sudoku options={state.options}/></div>
                </div>
                <div className="footer">
                    <Footer
                        showHints={state.options.showHints}
                        onChange={handleOptionsChange}
                    />
                </div>
            </div>
        );

}

export default App;

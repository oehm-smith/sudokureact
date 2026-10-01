# Sudoku React — user guide

A Sudoku board you play in the browser. The puzzle's starting numbers are fixed; every other
square is a dropdown you pick a value from.

## Running it

```shell
npm install
npm run dev
```

Vite prints the address it has chosen — usually <http://localhost:5173/>, but it moves to the next
free port if that one is taken, so read the console rather than assuming.

## Playing

- **Given squares** are shown as plain text and can not be changed.
- **Empty squares** are dropdowns. Pick a value to play it, or pick the blank entry to clear the
  square again.
- The heavier rules divide the board into its nine three-by-three cells.

## Show Hints

The checkbox below the board controls what each dropdown offers.

| Show Hints | A square offers |
|---|---|
| On (the default) | only the values that keep the Sudoku invariant true — nothing already used in that square's row, column or three-by-three cell |
| Off | every value, 1 to 9 |

With hints on, a square you have already filled still offers its own current value, so you can see
what you played. The hints are recalculated across the whole board after every move.

## Deploying a local copy

```shell
./buildDeployLocalWWW.sh
```

Builds the site and copies `dist/` to `~/Sites/tintuna.com/projects/sudokureact`.

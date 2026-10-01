# Sudoku React — developer guide

React 18 + TypeScript on Vite. Previously a React 15 / Webpack / Create React App project, which
is why a few CRA conventions still show up in the history.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | `tsc` typecheck followed by `vite build`, output in `dist/` |
| `npm run lint` | ESLint over `.ts` and `.tsx`, warnings treated as failures |
| `npm test` | Jest, via ts-jest, in a jsdom environment |
| `npm run preview` | Serve the contents of `dist/` |

If `npm run dev` fails with `Cannot find module '@rollup/rollup-darwin-arm64'`, npm has skipped the
platform-specific optional dependency ([npm/cli#4828](https://github.com/npm/cli/issues/4828)).
Delete `node_modules` and `package-lock.json` and install again — the lockfile deletion is the part
that matters.

## The model

The interesting part of the project is the board model, and it is deliberately independent of
React.

- **`Point`** — a 1-indexed `(x, y)` position on the board. The board array is 0-indexed; `Board`
  translates between the two.
- **`RCC`** — a Row, Column or Cell: one rectangular region, described by its top-left and
  bottom-right `Point`. It holds a *live reference* to the board array, so `usedValues()` always
  reflects the current position.
- **`Board`** — the value array plus twenty-seven `RCC`s: nine rows, nine columns, nine cells. A
  square's legal values are whatever is left after subtracting the union of its three regions from
  1..9.

`Board` is parameterised on `rccSize`, so a 16x16 board is in principle possible; `Sudoku.tsx`
fixes it at 9.

## The React layer

```
App            owns the options (Show Hints) and the page layout
├── Sudoku     owns the Board, computes the hints, renders the table
│   └── Selector × 81   one square: a dropdown, or plain text if the square is a given
└── Footer     the Show Hints checkbox and the link to the source
```

All four are function components.

### Hints are computed in the parent

`Sudoku` recomputes the legal values for every square in one pass whenever the board or the
Show Hints option changes, and passes each `Selector` the list it should offer. `Selector` is
purely presentational.

This matters: each `Selector` used to run its own effect against the board, so a single keystroke
re-rendered all 81 of them and issued 81 asynchronous lookups.

### The board is mutated in place

`Sudoku.handleValueChange` writes into `board.board[index]` rather than building a new `Board`.
That is deliberate — every `RCC` holds a reference to the same array, which is how a region's used
values stay current — but it means the board's identity never changes. A `version` counter is what
drives re-renders. **Anything added later that memoises on board identity (`React.memo`,
`useMemo`) will silently fail to update.**

### Grid presentation

`grid.ts` holds the pure helpers: `buildClasses` marks the three-by-three boundaries with
`cellFooter` / `cellWall` for the stylesheet, and `optionValuesFor` builds a square's option list.
They live outside `Sudoku.tsx` so that file exports only its component, which is what Vite's fast
refresh wants.

`puzzles.ts` holds the starting position.

## Styling

- `index.css` — the Vite base stylesheet, light and dark schemes.
- `App.css` — page layout: header, board area, footer.
- `Sudoku.css` — the grid. Borders use `currentColor` so they read in both schemes; the dropdowns
  are stripped of their native chrome so the table reads as a grid.

## Tests

Jest with ts-jest, in jsdom. Specs sit beside the code as `*.spec.ts` / `*.spec.tsx`.

- Stylesheet and SVG imports are stubbed by `test/assetStub.cjs` — Jest does not bundle assets.
- `jest.setup.cjs` registers `@testing-library/jest-dom`'s matchers.
- Assertions use Jest's own `expect` throughout.

A move triggers a synchronous state update and then an asynchronous hint recalculation, so
component tests flush both inside `act` (see the `play` and `toggle` helpers) rather than using
`userEvent` directly. Test output is expected to be free of React `act` warnings.

## Known gaps

- The starting board is fixed — see the TODO in `puzzles.ts`.
- There is no solver. The original goal was an animated solve; one exists in the oehmsmith.com
  port of this model and is pure logic over `Board`, so it would transfer back.

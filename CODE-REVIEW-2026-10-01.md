# sudokureact — code review and repair brief

**Date:** 2026-10-01  
**Repo:** `~/dev/home/sudokureact` (resolves to `~/CloudStation/Dev/home/sudokureact`)  
**Remote:** `git@github.com:oehm-smith/sudokureact.git`  
**Branch:** `master`, clean, at `02d9890 starting to convert to react hooks`  
**Reviewer:** Claude, while porting this code into oehmsmith.com

---

## Summary

**The project does not currently build, lint, or run.** The test suite passes, but it covers only
three array helpers.

The game logic is sound and worth preserving. Everything broken is in the React layer, the
toolchain, or the styling — and most of it traces to the half-finished hooks migration recorded in
the latest commit message.

| Command | State |
|---|---|
| `npm run build` | **Fails** — 9 TypeScript errors |
| `npm run lint` | **Fails** — no ESLint configuration file exists |
| `npm run dev` | **Fails** — `node_modules` missing `@rollup/rollup-darwin-arm64` |
| `npm test` | Passes — 4 tests, all on `utils.ts` |

Because the dev server cannot start, the findings below come from reading the source and from
`tsc`. Runtime behaviour was not directly observed. The reasoning is given for each so it can be
checked rather than taken on trust.

---

## 0. Before anything else: reinstall dependencies

```
Error: Cannot find module '@rollup/rollup-darwin-arm64'
```

This is the known npm bug where optional platform-specific dependencies are skipped
(npm/cli#4828). It is unrelated to the code and will block every other task.

```bash
rm -rf node_modules package-lock.json
npm install
```

Context worth knowing: Brooke upgraded to macOS 27 recently and had to re-download dependencies
across the machine. Other tooling on this machine broke the same way. If `npm install` alone does
not fix it, the lockfile deletion is the part that matters.

---

## 1. Blockers — the build

`npm run build` runs `tsc && vite build`, so these stop the build outright. All nine, in the order
`tsc` reports them:

### 1.1 `Footer.tsx` is never exported — `App.tsx:3`

```
error TS1192: Module '.../src/Footer' has no default export.
```

`Footer.tsx` declares `async function Footer(props)` and `function Information()`. Neither is
exported. The only export is `interface OptionsProp`.

`App.tsx` does `import Footer from './Footer'`, which resolves to `undefined`, and then renders
`<Footer ... />`. Rendering an undefined component throws:

> Element type is invalid: expected a string or a class/function but got: undefined.

**This means the application almost certainly crashes on first render, and the Show Hints checkbox
and the GitHub link have never appeared in the UI.** Worth confirming in a browser once the install
is fixed, because it changes how much of the rest matters.

### 1.2 `Footer` is an async component — `Footer.tsx:12`

```tsx
async function Footer(props) {
```

An `async` function returns a Promise. React cannot render a Promise — this is not a valid
component in React 18 under any circumstance. Even once exported, it will not work.

**Fix:** make it a plain function. It does not await anything; the `async` is vestigial.

### 1.3 `Footer` props are untyped — `Footer.tsx:12`

```
error TS7006: Parameter 'props' implicitly has an 'any' type.
```

`OptionsProp` is declared immediately above and is exactly the right shape. It is simply not
applied.

**Fix:** `function Footer(props: OptionsProp)`.

### 1.4 Unused `React` import — `Footer.tsx:1`

`import * as React from 'react'` with `jsx: "react-jsx"` in tsconfig. The new JSX transform makes
it unnecessary, and `noUnusedLocals` rejects it.

**Fix:** delete the import. The same applies to `Sudoku.tsx`, which needs `React` only for
`React.Component`, so there the import must stay (and should become
`import { Component } from 'react'` or be left as-is).

### 1.5 `App` declares a prop it never reads — `App.tsx:31`

```tsx
function App(props: AppState) {
    const [state, setState] = useState({options: {showHints: true}});
```

`props` is unused because the initial state is hardcoded. `noUnusedParameters` rejects it.

### 1.6 `App` is rendered without its required prop — `main.tsx:8`

```
error TS2741: Property 'options' is missing in type '{}' but required in type 'AppState'.
```

The flip side of 1.5. `main.tsx` renders `<App />` with no props at all.

**Fix (covers both):** `App` owns its own state and takes nothing. Drop the parameter and the
`AppState` interface, or make the prop optional and actually use it as the initial value. The
former is simpler and matches what the code does.

### 1.7 `RCC.availableValues` ignores both parameters — `RCC.ts:72`

```ts
public availableValues(row: number, col: number): Array<number | null> {
    return [null];
}
```

An unimplemented stub. `Board.getPossibleValues` is what actually computes available values, and
nothing calls this method.

**Fix:** delete it, or prefix the parameters with `_` if it is being kept as a placeholder. Deleting
is cleaner — there is no caller and the real implementation lives elsewhere.

### 1.8 `getCells` returns `{}` — `Sudoku.tsx:118`

```ts
private getCells(row: number): {} {
```

Declared as `{}`, which is not assignable to `ReactNode`. It actually returns
`Array<JSX.Element | string>`.

**Fix:** type it `(JSX.Element | string)[]`, or better, see §3.1.

---

## 2. Blockers — the toolchain

### 2.1 No ESLint configuration

`npm run lint` invokes ESLint 8, which looks for `.eslintrc.*`. There is no config file anywhere in
the project or its ancestors, so lint has never run. The ESLint plugins are all installed and listed
in `devDependencies`, so this is a missing file rather than a missing dependency.

**Fix:** add `.eslintrc.cjs` with `@typescript-eslint`, `react-hooks` and `react-refresh` — the
standard Vite React-TS template config, matching the plugins already installed.

### 2.2 The deploy script copies the wrong directory

`buildDeployLocalWWW.sh`:

```bash
cp -r build $LOCAL_DEPLOY_DIR
```

Vite outputs to `dist/`, not `build/`. `build/` is the Create React App convention this project
migrated away from. The script will fail at the copy, after having already deleted the destination
directory — so it destroys the existing deployment and replaces it with nothing.

**Fix:** `cp -r dist "$LOCAL_DEPLOY_DIR"`. While there, quote the variable: the path is under
`~/Sites/` and an unquoted `rm -r` on an unset variable is worth not having.

---

## 3. Correctness and performance

### 3.1 `getCells` scans the whole board once per row

```ts
return this.state.board.board.map((_: number, index: number) => {
    if (index + 1 >= indexInRowStart && index + 1 <= indexInRowEnd) {
        return (<td .../>);
    } else {
        return '';
    }
});
```

Called once per row, it maps all 81 entries and discards 72 of them — 729 iterations and 648
discarded empty strings per render, to produce 81 cells. The empty strings are also emitted into the
DOM as text nodes inside `<tr>`, which is invalid HTML.

**Fix:** slice the row and map only it.

```ts
const start = (row - 1) * 9;
return this.state.board.board.slice(start, start + 9).map((_, i) => {
    const index = start + i;
    return <td key={index} className={this.buildClasses(index)}>...</td>;
});
```

### 3.2 `Selector` re-runs its effect for all 81 squares on every keystroke

```tsx
useEffect(() => { ... }, []);        // on mount
useEffect(() => { ... }, [props]);   // on every props change
```

`props` is a fresh object on every parent render. `Sudoku.handleValueChange` calls `setState` for
any change, re-rendering all 81 `Selector`s with new props objects, so the second effect fires 81
times and issues 81 async `getPossibleValuesByIndex` calls — for one keystroke.

It is not an infinite loop (a `Selector`'s own state updates do not change its props identity), but
it is O(board) async work per move.

Note also that the two effects are identical apart from the dependency array; the first is redundant
once the second is correct.

**Fix:** depend on the values that actually matter, not the props object:

```tsx
useEffect(() => { ... }, [props.index, props.options.showHints, props.board.board[props.index]]);
```

Better still, hoist the calculation: compute hints for the whole board once in the parent when the
board changes, and pass each `Selector` its own array. That turns 81 async calls into one pass.

### 3.3 `Selector` renders a duplicate blank option

```tsx
<option key={props.index}>{value > 0 ? value : ''}</option>
{optionValues.map(...)}
```

`buildPossibleValues` already prepends `0` to the list, which `makeOption` renders as `''`. So a
blank square gets two blank options.

The `<option>` elements also carry no `value` attribute, so the browser uses their text content.
`<select value={value}>` compares a `number` against those strings. It works through coercion, but
it is accidental.

**Fix:** give options explicit `value` attributes, and drop the manually prepended current-value
option.

### 3.4 Board mutation in place

```ts
let newBoard: Board = this.state.board;
newBoard.board[index] = parseInt(...);
this.setState(() => ({ board: newBoard }));
```

`newBoard` is the same object as `this.state.board`. The re-render happens because `setState` is
called with a new wrapper object, not because the board changed identity.

This is not currently a bug — `RCC` instances hold a live reference to the same array, which is how
`usedValues()` stays current — but it is fragile. Anything added later that memoises on board
identity (`React.memo`, `useMemo`) will silently fail to update.

**Worth a comment at minimum**, explaining that mutation is deliberate and why.

---

## 4. The board has no styling

`Sudoku.tsx` emits `cellFooter` and `cellWall` classes to mark the three-by-three boundaries.
`App.tsx` emits `App-header`, `body`, `board`, `footer`.

**None of these classes are defined.** `App.css` contains only the Vite starter template's logo
animation and `#root` rules; `index.css` is the unmodified Vite starter stylesheet.

So the grid renders as a bare HTML table with no block separation — which is most of what makes a
Sudoku grid readable.

The class-computation logic in `buildClasses` is correct, incidentally:
`Math.ceil((index + 1) / 9) % 3 === 0` gives rows 3, 6, 9 and `(index + 1) % 3 === 0` gives columns
3, 6, 9. Only the CSS is missing.

**Fix:** write the stylesheet. Borders on `.cellWall` / `.cellFooter`, a visible outer border, and
sizing on the table cells.

---

## 5. Test coverage

`utils.spec.ts` covers `arrayRange`, `arrayDifference` and `arrayUnion3`. Four tests, all passing.

`Board.ts` (228 lines), `RCC.ts` (84) and `Point.ts` (16) have no tests at all — and `Board` is where
the actual Sudoku reasoning lives: `indexToPoint`, `determineCell`, `getRCCUnion`,
`getPossibleValues`.

While porting this code I wrote 25 tests against that logic and **found no defects in it** — it
behaves correctly, including an exhaustive check that no square is ever offered a value that would
break the Sudoku invariant. The logic is good; it is simply unverified in this repo.

If useful, those tests can be lifted back from
`~/CloudStation/Dev/WebSite/personal/site/src/islands/sudoku/Board.test.ts` — they are written for
Vitest, and the assertion style translates to Jest almost one to one (`toEqual`, `toBe`,
`toHaveLength`, `resolves.toEqual` are the same in both).

The existing `utils.spec.ts` uses chai inside Jest, which works but means two assertion libraries in
one project. Worth standardising on Jest's own `expect`.

---

## 6. Smaller things

- **`ts-node` is in `dependencies`.** It is a build-time tool and belongs in `devDependencies`.
- **Console noise.** `Sudoku.render` calls `console.time`/`timeEnd` on every render; `Board.load`
  logs the full board on construction; `RCC.isIn` logs on every call (though `isIn` has no callers).
  Fine while debugging, not for a deployed page.
- **Mixed component styles.** `Sudoku` is a class component; `App`, `Selector` and `Footer` are
  hooks. This is the migration in progress noted in the last commit. Converting `Sudoku` would
  finish it.
- **`"type": "commonjs"`** in `package.json` alongside ESM source. Vite and ts-jest both cope, but
  `"module"` is the honest value for this codebase.
- **`RCC.usedValues` hardcodes 9** (`let index = row * 9 + col`) with a `// TODO - 9!` beside it,
  while the rest of `Board` is parameterised on `rccSize`. A 16x16 board would break here first.
- **`Board.getRCCDifference` hardcodes `arrayRange(1, 9)`**, with its own `// TODO`. Same issue.
- **`usedValues()` sorts numbers with the default comparator**, which sorts lexicographically. Safe
  for 1–9; wrong the moment the board exceeds 9.

---

## 7. Suggested order of work

1. **Reinstall dependencies** (§0). Nothing else can be verified until this is done.
2. **Fix the nine build errors** (§1). Start with `Footer.tsx` — export it and drop the `async`,
   which is the one most likely to be preventing the app from rendering at all.
3. **Open it in a browser and confirm what actually works.** The findings below this line were
   derived by reading; seeing the running app may reorder their priority.
4. **Write the missing CSS** (§4). The game is hard to evaluate without the grid lines.
5. **Add the ESLint config** (§2.1) and fix the deploy script (§2.2).
6. **Fix `getCells` and the `Selector` effects** (§3.1, §3.2) — both are small and both are on the
   per-keystroke path.
7. **Port the board tests across** (§5).
8. **Tidy the rest** (§6) as convenient.

---

## 8. What is *not* wrong

Worth stating, since the list above is long:

The core model is the good part of this project and should be left alone. Representing the board as
twenty-seven overlapping regions — nine rows, nine columns, nine cells — and deriving a square's
legal values from the three it belongs to is a clean idea, cleanly expressed. `Board`, `RCC` and
`Point` carried into a completely different codebase unchanged and worked first time.

Everything broken here is in the layer above it.

---

## 9. One piece of context

`README.md` states the original end goal:

> automatically solve the puzzle for you in real-time, but slowed down so you could see it happening

That feature is currently being built in the port at
`~/CloudStation/Dev/WebSite/personal/site/src/islands/sudoku/`, as an animated backtracking solver
driven by a generator, with a speed control. If it is wanted here too, the solver is pure logic over
the existing `Board` and would transfer back the same way the tests would.

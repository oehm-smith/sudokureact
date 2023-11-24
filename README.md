# Sudoku React

This is Sudoku written in reactjs.  Functionally it will let you solve a puzzle and optionally allow you to list the possible numbers available in each cell.

An end goal for this, but never achieved (I moved on to something else!) was to automatically solve the puzzle for you in real-time, but slowed down so you could see it happening.  A previous project [https://github.com/oehm-smith/sudokme](https://github.com/oehm-smith/sudokme) did this and was written in Java and SWT for the GUI.

This app is now based on React 18 + TypeScript + Vite and previously it was a React 15 project running under Webpack and created with Create React App (CRA).

## HowTo

```shell
git clone https://github.com/oehm-smith/sudokureact
cd sudokureact
npm i
npm run dev
# Open http://localhost:5174/ (but see the console incase this changes)
```

---

# VITE 
(**original README**)

This template provides a minimal setup to get React working in Vite with HMR [Hot Module Reloading] and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

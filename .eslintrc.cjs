// ABOUTME: ESLint configuration — TypeScript, React hooks rules and Vite's fast-refresh check.
// ABOUTME: Matches the plugins already listed in devDependencies.

module.exports = {
    root: true,
    env: {browser: true, es2020: true, node: true, jest: true},
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            {allowConstantExport: true},
        ],
    },
};

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["eslint-plugin-react"],
  rules: {
    'react/jsx-no-literals': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  },
};

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "eslint-config-turbo",
  ],
  plugins: ["import"],
  rules: {
    "import/named": "error",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error",
    "import/no-named-as-default": "warn",
    "import/no-named-as-default-member": "warn",
    "import/no-duplicates": "warn",
    "import/order": ["warn", {
      "groups": [
        "builtin",
        "external",
        "unknown",
        ["internal", "sibling", "parent"],
        "index",
        "object"
      ],
      "newlines-between": "always-and-inside-groups",
    }],
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
  ],
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
    },
  ],
};

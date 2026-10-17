import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const VAGUE_NAMES = ["res", "req", "tmp", "val", "obj", "arr", "fn", "cb"];

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "id-length": ["error", { min: 2, exceptions: ["i"], properties: "never" }],
      "id-denylist": ["error", ...VAGUE_NAMES],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "react/no-multi-comp": "error",
      "@next/next/no-img-element": "error",
      "no-empty": ["error", { allowEmptyCatch: false }],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "padding-line-between-statements": ["error", { blankLine: "always", prev: "*", next: "return" }],
      "no-restricted-syntax": [
        "error",
        {
          selector: ":matches(TSTypeAliasDeclaration, TSInterfaceDeclaration)[id.name='Props']",
          message: "Name the props type <ComponentName>Props.",
        },
        {
          selector: "FunctionDeclaration[id.name=/^[A-Z]/] > ObjectPattern > TSTypeAnnotation > TSTypeLiteral",
          message: "Declare a named <ComponentName>Props type instead of an inline type.",
        },
        {
          selector: "TSQualifiedName[left.name='React'][right.name=/^FormEvent(Handler)?$/]",
          message: "Deprecated in React 19: use React.SyntheticEvent<HTMLFormElement>.",
        },
        {
          selector:
            "VariableDeclarator[init.callee.name='useState'][init.arguments.0.raw=/^(true|false)$/][id.elements.0.name!=/^(is|has|should|can)[A-Z]/]",
          message: "Boolean state starts with is/has/should/can.",
        },
        {
          selector: "ExportAllDeclaration",
          message: "Name every export; no `export *`.",
        },
        {
          selector: ":matches(Literal[value=/localhost:4000/], TemplateElement[value.raw=/localhost:4000/])",
          message: "Call /api/* through src/lib/api.ts; the Next.js rewrite keeps the auth cookie same-origin.",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;

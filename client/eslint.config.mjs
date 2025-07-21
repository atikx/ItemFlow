import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from 'typescript-eslint'; // Import tseslint for type-aware rules

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Add a new configuration object specifically for TypeScript rules
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply these rules to TypeScript and TSX files
    plugins: {
      '@typescript-eslint': tseslint.plugin, // Register the TypeScript ESLint plugin
    },
    rules: {
      // Disable the no-explicit-any rule
      '@typescript-eslint/no-explicit-any': 'off',
      // You might also want to set no-unused-vars to 'off' or 'warn' if it's blocking builds
      '@typescript-eslint/no-unused-vars': 'off', // or 'warn'
      // You may also need to disable a similar rule from the base ESLint config
      'no-unused-vars': 'off' // This is the base ESLint rule, sometimes it conflicts
    },
  },
];

export default eslintConfig;
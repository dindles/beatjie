import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts', '**/*.svelte'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.svelte']
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        HTMLElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        TouchEvent: 'readonly',
        MouseEvent: 'readonly',
        WheelEvent: 'readonly',
        PointerEvent: 'readonly',
        KeyboardEvent: 'readonly',
        getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        ResizeObserver: 'readonly',
        MutationObserver: 'readonly',
        localStorage: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Variables should be snake_case
        {
          selector: 'variable',
          format: ['snake_case'],
          leadingUnderscore: 'allow'
        },
        // Constants should be SHOUTY_SNAKE_CASE
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE', 'snake_case'], // Allow both for flexibility with imports
          leadingUnderscore: 'allow'
        },
        // Functions should be camelCase
        {
          selector: 'function',
          format: ['camelCase']
        },
        // Classes should be PascalCase
        {
          selector: 'class',
          format: ['PascalCase']
        },
        // TypeScript interfaces and types should be PascalCase
        {
          selector: 'interface',
          format: ['PascalCase']
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase']
        },
        // Methods should be camelCase
        {
          selector: 'method',
          format: ['camelCase']
        },
        // Parameters should be snake_case
        {
          selector: 'parameter',
          format: ['snake_case'],
          leadingUnderscore: 'allow'
        }
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  // Svelte files configuration
  ...sveltePlugin.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte']
      }
    },
    rules: {
      // Apply same naming conventions to Svelte files
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['snake_case'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE', 'snake_case'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'function',
          format: ['camelCase']
        },
        {
          selector: 'class',
          format: ['PascalCase']
        },
        {
          selector: 'parameter',
          format: ['snake_case'],
          leadingUnderscore: 'allow'
        }
      ]
    }
  },
  // Prettier config should come last to override formatting rules
  prettier,
  {
    ignores: [
      '.svelte-kit/**',
      'build/**',
      'node_modules/**',
      'dist/**',
      '**/*.config.js',
      'vite.config.ts',
      'svelte.config.js',
      '**/*.svelte.ts' // Svelte 5 runes not fully supported by ESLint yet
    ]
  }
];

// .eslintrc.cjs
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json', // if you use TypeScript + strict rules
  },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended', // must be last
  ],

  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'prettier',
  ],

  settings: {
    react: {
      version: 'detect',
    },
  },

  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // React rules
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off', // we use TypeScript instead
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: false },
    ],

    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'warn',
    'no-duplicate-imports': 'error',

    // Accessibility (good practice)
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',

    // Allow some flexibility in React components
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'warn',
  },

  overrides: [
    // JavaScript-only files (no TypeScript parser)
    {
      files: ['**/*.js', '**/*.jsx', 'vite.config.js', '*.config.js', '*.config.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
      },
    },
  ],

  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    '*.min.js',
    'coverage',
    'public',
  ],
};
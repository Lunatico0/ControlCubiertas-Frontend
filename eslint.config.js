import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // Los fixtures de import-case existen para que check-import-case.mjs tenga qué resolver:
  // son código a propósito "roto" y no se compilan.
  { ignores: ['dist', 'node_modules', 'src/tests/fixtures/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // El proyecto no usa PropTypes ni TypeScript: la regla generaba 685 errores que
      // sepultaban los ~50 reales. Apagarla es lo que hace utilizable a eslint acá.
      'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Tests: globals de vitest/testing-library.
    files: ['src/tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
  },
  {
    // Scripts de build/checks: corren en Node, no en el browser.
    files: ['scripts/**/*.{js,mjs,cjs}', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]

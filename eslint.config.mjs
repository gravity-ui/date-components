import baseConfig from '@gravity-ui/eslint-config';
import a11yConfig from '@gravity-ui/eslint-config/a11y';
import clientConfig from '@gravity-ui/eslint-config/client';
import importOrderConfig from '@gravity-ui/eslint-config/import-order';
import prettierConfig from '@gravity-ui/eslint-config/prettier';
import vitestConfig from '@vitest/eslint-plugin';
import {defineConfig, globalIgnores} from 'eslint/config';
import reactCompiler from 'eslint-plugin-react-compiler';
import storybookPlugin from 'eslint-plugin-storybook';
import globals from 'globals';

export default defineConfig([
    baseConfig,
    clientConfig,
    prettierConfig,
    importOrderConfig,
    a11yConfig,
    storybookPlugin.configs['flat/recommended'],
    {
        extends: [reactCompiler.configs.recommended],
        rules: {'react-compiler/react-compiler': 'warn'},
    },
    {
        rules: {
            complexity: 'off',
            'react/jsx-fragments': ['error', 'element'],
            'react/react-in-jsx-scope': 'off',
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "ImportDeclaration[source.value='react'] :matches(ImportNamespaceSpecifier, ImportSpecifier)",
                    message: "Please use import React from 'react' instead.",
                },
                {
                    selector: "TSTypeReference>TSQualifiedName[left.name='React'][right.name='FC']",
                    message: "Don't use React.FC",
                },
            ],
            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
            'jsx-a11y/no-autofocus': ['error', {ignoreNonDOM: true}],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/prefer-ts-expect-error': 'error',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {prefer: 'type-imports', fixStyle: 'separate-type-imports'},
            ],
        },
    },
    {
        files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
        extends: [vitestConfig.configs.recommended],
        languageOptions: {globals: {...globals.browser}},
    },
    {files: ['**/__stories__/**/*.[jt]s?(x)'], rules: {'no-console': 'off'}},
    {files: ['**/*.js', '!src/**/*'], languageOptions: {globals: {...globals.node}}},
    globalIgnores(['dist', 'storybook-static', '!/.storybook', 'reports']),
]);

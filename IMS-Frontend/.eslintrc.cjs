module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh', 'boundaries'],
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
        },
        boundaries: {
            include: ['src/**/*'],
            elements: [
                {
                    type: 'app',
                    pattern: 'src/app/*',
                },
                {
                    type: 'domains',
                    pattern: 'src/domains/*',
                },
                {
                    type: 'shared',
                    pattern: 'src/shared/*',
                },
                {
                    type: 'state',
                    pattern: 'src/state/*',
                },
            ],
        },
    },
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

        // Boundaries Rules
        'boundaries/element-types': [
            'error',
            {
                default: 'allow',
                rules: [
                    {
                        from: 'shared',
                        allow: ['shared'], // Shared can only import other shared (and external)
                        message: 'Shared modules cannot import from upper layers (App, Domains, State)',
                    },
                    {
                        from: 'state',
                        allow: ['shared', 'state'], // State can import shared and other state
                        message: 'State modules cannot import from Domains or App',
                    },
                    {
                        from: 'domains',
                        allow: ['shared', 'state', 'domains'], // Domains can import shared, state, and other domains (loosened for now, but ideally strict)
                        // Ideally domains shouldn't import other domains directly, but let's start permissive
                    },
                    {
                        from: 'domains',
                        target: 'domains',
                        message: 'Cross-domain imports should be minimized. Consider moving shared logic to Shared or State.',
                        // Warn for now to identify coupling
                    },
                    {
                        from: 'app',
                        allow: ['shared', 'state', 'domains', 'app'], // App is the glue
                    },
                ],
            },
        ],
    },
};

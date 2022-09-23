module.exports = {
    'env': {
        es2021: true,
        node: true,
        jest: true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true
        },
        'ecmaVersion': 13,
        'sourceType': 'module'
    },
    'plugins': [
        'react'
    ],
    settings: {
        react: {
            createClass: "createReactClass", // Regex for Component Factory use,
            // default to "createReactClass"
            pragma: "React", // Pragma to use, default to "React"
            version: "17.0", // React version. "detect" automatically picks
            // the version you have installed.
            // You can also use `16.0`, `16.3`, etc, if you
            // want to override the detected value.
            flowVersion: "0.53", // Flow version
        },
        propWrapperFunctions: [
            // The names of any function used to wrap propTypes, e.g.
            // `forbidExtraProps`. If this isn't set, any propTypes wrapped in
            // a function will be skipped.
            "forbidExtraProps",
            { property: "freeze", object: "Object" },
            { property: "myFavoriteWrapper" },
        ],
    },
    'rules': {
        /*******       LOGIC      *******
             * https://eslint.org/docs/latest/rules/
            */
        'no-await-in-loop': 'warn',
        'no-template-curly-in-string': 'warn',
        'no-unused-vars': ['error', {
            varsIgnorePattern: 'should|expect',
        }],
        'no-use-before-define': ['warn', 'nofunc'],
        'require-atomic-updates': 'warn',

        /*******   SUGGESTIONS   *******/
        'no-console': 'off',
        strict: ['warn', 'safe'],

        /*******    LAYOUT & FORMATTING    *******/
        'array-bracket-spacing': ['off'],
        'func-call-spacing': ['off'],
        indent: ['warn', 4, {
            SwitchCase: 1,
            MemberExpression: 'off',
        }],
        'jsx-quotes': ['off', 'prefer-single'],
        'linebreak-style': ['error', 'unix' ],
        'no-multiple-empty-lines': ['warn', {
            max: 5,
            maxBOF: 5,
            maxEOF: 1,
        }],
        'object-curly-spacing': ['off'],
        quotes: ['off', 'single'],
        semi: ['error', 'always'],
        'space-in-parens': ['off', 'always'],

        /*******   REACT RULES   *******/
        'react/jsx-uses-react': 'warn',
    }
};

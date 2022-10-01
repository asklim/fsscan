module.exports = function (api) {

    const isTest = api.env('test');
    const presets = [
        [
            '@babel/preset-env',
            {
                targets: {
                    esmodules: true,
                    node: 'current'
                }
            }
        ]
    ];

    return isTest ?
        {
            presets,
        }
        :{};
};

module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['babel-plugin-react-compiler'], // must run first!
            [
                'transform-inline-environment-variables',
                {
                    include: [
                        'API_URL',
                        'API_DEV_URL',
                        'SITE_URL',
                        'GOOGLE_WEB_CLIENT_ID',
                        'GOOGLE_IOS_CLIENT_ID',
                    ],
                },
            ], // must run before react-native-worklets/plugin
            'react-native-worklets/plugin', // must run last!
        ],
    };
};

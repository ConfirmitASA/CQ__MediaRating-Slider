const path = require('path');
const CopyPlugin = require('copy-webpack-plugin')
module.exports = {
    entry: './design_dev/design_main.js',
    output: {
        filename: './design_main.js',
        path: path.resolve(__dirname, 'design'),
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                path.resolve(__dirname, 'design_dev', 'index.html'),
                path.resolve(__dirname, 'design_dev', 'customSettingsStyles.css'),
                path.resolve(__dirname, 'design_dev', 'design-page-components.css'),
                path.resolve(__dirname, 'design_dev', 'design-page-components.js')
            ],
        })
    ]
};




const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './runtime-dev/component.js',
    output: {
        filename: './component.js',
        path: path.resolve(__dirname, 'runtime'),
    },
		mode: 'development',
    optimization: {
        minimize: false
    },
    devServer: {
        https: true,
        disableHostCheck: true
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
    }
};
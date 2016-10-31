var webpack = require('webpack');


var configs = {
    compile: {
        output: {
            path: './dist',
            filename: 'jerboa.js'
        },
        entry: './src/webpack-entry.js',
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                }
            ]
        }
    },

    uglify: {
        entry: './dist/jerboa.js',
        target: 'node',
        output: {
            path: './dist',
            filename: 'jerboa.min.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                }
            ]
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: true },
                exclude: /node_modules/
            })
        ]
    }
};


module.exports = configs[process.env.WEBPACK_STEP];
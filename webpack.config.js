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
                    loader: 'babel-loader'
                }
            ]
        }
    },

    uglify: {
        entry: './dist/jerboa.js',
        output: {
            path: './dist',
            filename: 'jerboa.min.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader'
                }
            ]
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: true }
            })
        ]
    }
};


module.exports = configs[process.env.WEBPACK_STEP];
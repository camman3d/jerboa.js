var webpack = require('webpack');
var path = require('path');
var precss = require('precss');
var autoprefixer = require('autoprefixer');

var configs = {
    // JS steps
    compile: {
        entry: './src/webpack-entry.js',
        output: {
            path: './dist',
            filename: 'jerboa.js'
        },
        module: {
            loaders: [
                {
                    test: path.join(__dirname, 'src'),
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
                    test: './src',
                    loader: 'babel-loader'
                }
            ]
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: true }
            })
        ]
    },

    // Style steps
    styles: {
        module: {
            loaders: [
                {
                    test: /\.less$/,
                    loader: 'style!css!less'
                }
            ]
        }
    }
};


module.exports = configs[process.env.WEBPACK_STEP];
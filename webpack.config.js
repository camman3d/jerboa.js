var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


//var path = require('path');
//var precss = require('precss');
//var autoprefixer = require('autoprefixer');

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
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin('jerboa.css', {
                allChunks: true
            })
        ]
    }




    //uglify: {
    //    entry: './dist/jerboa.js',
    //    output: {
    //        path: './dist',
    //        filename: 'jerboa.min.js'
    //    },
    //    module: {
    //        loaders: [
    //            {
    //                test: './src',
    //                loader: 'babel-loader'
    //            }
    //        ]
    //    },
    //    plugins: [
    //        new webpack.optimize.UglifyJsPlugin({
    //            compress: { warnings: true }
    //        })
    //    ]
    //},
    //
    //// Style steps
    //styles: {
    //    module: {
    //        loaders: [
    //            {
    //                test: /\.less$/,
    //                loader: 'style!css!less'
    //            }
    //        ]
    //    }
    //}
};


//module.exports = configs[process.env.WEBPACK_STEP];
module.exports = configs.compile;
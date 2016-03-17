var webpack = require("webpack");
module.exports = {
    entry: {
        app: "./app.js"
    },

    output: {
        filename: "output.js"
    },

    devtool: 'source-map',

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ["babel-loader"]
            }
        ]
    }
};
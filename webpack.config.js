var webpack = require("webpack");
module.exports = {
    context: __dirname + "/src",
    entry: {
        mainApp: "./index.js"
    },

    output: {
        filename: "redux-collection.js",
        path: __dirname + "/dist"
    },

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
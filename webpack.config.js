const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    mson: './src/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: '[name]',
  },

  devtool: "source-map",

  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  }
};

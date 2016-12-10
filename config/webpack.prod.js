const path = require('path');

module.exports = {
  entry: "./server.js",
  output: {
    path: path.join(__dirname, 'build'),
    filename: "server.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      },
    ],
  },
};

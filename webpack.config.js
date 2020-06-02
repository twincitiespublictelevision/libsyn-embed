var webpack = require('webpack');

module.exports = {
  entry: './src/player.js',
  output: {
    path: __dirname,
    filename: 'dist/libsyn.min.js',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      { 
        test: /\.js$/, 
        exclude: [/node_modules/, /test\.js/],
        loaders: [
          'babel-loader'
        ]
      }
    ]
  },
  plugins: [
  ]
};

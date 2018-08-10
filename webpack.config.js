const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
      index: './src/index.js',
      background: './src/background.js',
      content: './src/content.js'
  },
  plugins: [
      new CleanWebpackPlugin(['dist'])
  ],
  devtool: 'source-map',
  module: {
      rules: [
          {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                  loader: 'babel-loader'
              }
          },
          {
              test: /\.png$/,
              use: {
                  loader: 'file-loader',
                  options: {
                      name: '[path][name].[ext]'
                  }
              }
          },
          {
              test: /manifest\.json$/,
              type: 'javascript/auto',
              use: {
                  loader: 'file-loader',
                  options: {
                      name: '[path][name].[ext]'
                  }
              }
          }
      ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
};

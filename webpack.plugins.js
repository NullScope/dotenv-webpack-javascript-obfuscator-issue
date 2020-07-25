const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new DotenvPlugin(),
];

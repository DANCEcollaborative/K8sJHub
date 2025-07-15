const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'umd',
    publicPath: '',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader','css-loader'] },
      { test: /\.svg$/, type: 'asset/resource' }
    ]
  },
  devtool: 'source-map',
  externals: [
    '@jupyterlab/application',
    '@jupyterlab/apputils',
    '@jupyterlab/launcher',
    '@lumino/widgets',
    '@lumino/signaling',
    '@lumino/algorithm',
    '@lumino/messaging',
    '@lumino/properties',
    '@lumino/disposable'
  ]
};

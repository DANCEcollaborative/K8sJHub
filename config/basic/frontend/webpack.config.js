const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'plugin.js',
    path: path.resolve(__dirname, 'jlab_ws_chat_extension', 'lib'),
    libraryTarget: 'module'
  },
  experiments: {
    outputModule: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  mode: 'production'
};

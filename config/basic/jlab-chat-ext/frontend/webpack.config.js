const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'amd', // Required for JupyterLab extensions
    publicPath: ''
  },
  resolve: {
    extensions: ['.js', '.ts']
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
  externals: [
    /^@jupyterlab\/.+/,
    /^@lumino\/.+/
  ],
  devServer: {
    port: 3001,
    proxy: {
      '/chat-ext': {
        target: 'http://localhost:8888',
        changeOrigin: true
      }
    },
    hot: true
  }
};

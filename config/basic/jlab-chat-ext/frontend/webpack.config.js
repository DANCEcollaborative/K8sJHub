const path = require('path');

module.exports = {
  entry: './src/index.ts', // Webpack uses the transpiled output
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
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
      },
      {
        test: /\.svg$/,
        use: 'raw-loader'
      }
    ]
  },
  devServer: {
  port: 3001, // whatever your dev server runs on
  proxy: {
    '/chat-ext': {
      target: 'http://localhost:8888', // Jupyter server
      changeOrigin: true
    }
  },
  hot: true
}
  
};

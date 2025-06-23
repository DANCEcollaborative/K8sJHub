const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { dependencies } = require('./package.json');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../jlab_ws_chat_extension/labextension'),
    publicPath: '',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js']
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
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'jlab_ws_chat_extension',
      filename: 'remoteEntry.js',
      exposes: {
        './plugin': './src/index'
      },
      shared: {
        ...dependencies,
        '@jupyterlab/application': { singleton: true, requiredVersion: false },
        '@jupyterlab/apputils': { singleton: true, requiredVersion: false },
        '@lumino/widgets': { singleton: true, requiredVersion: false }
      }
    }),
    new WebpackManifestPlugin()
  ],
  mode: 'production'
};

// webpack.config.js

const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const baseConfig = {
  mode: 'none',
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    alias: {
      "@": path.resolve(__dirname, 'src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.?ts.?(x)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
          }
        }
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
          "postcss-loader",
        ],
      },
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public", to: "public" }
      ],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log",
  },
};

/** @type WebpackConfig */
const extensionConfig = {
  ...baseConfig,
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
};

/** @type WebpackConfig */
const viewsConfig = {
  ...baseConfig,
  target: 'web',
  entry: {
    chatView: './src/views/chat-view/index.tsx',
    changePlanView: './src/views/change-plan-view/ChangePlanView.tsx',
    fileExplorerView: './src/views/file-explorer-view/index.tsx',
    graphView: './src/views/graph-view/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
};

module.exports = [extensionConfig, viewsConfig];
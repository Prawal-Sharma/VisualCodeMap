const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const extensionConfig = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@commands': path.resolve(__dirname, 'src/commands'),
      '@parser': path.resolve(__dirname, 'src/parser'),
      '@analyzer': path.resolve(__dirname, 'src/analyzer'),
      '@graph': path.resolve(__dirname, 'src/graph'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log'
  }
};

const webviewConfig = {
  target: 'web',
  mode: 'none',
  entry: './src/webview/app.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/webview'),
    filename: 'webview.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@webview': path.resolve(__dirname, 'src/webview')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/webview/index.html',
      filename: 'index.html'
    })
  ],
  devtool: 'nosources-source-map'
};

module.exports = [extensionConfig, webviewConfig];
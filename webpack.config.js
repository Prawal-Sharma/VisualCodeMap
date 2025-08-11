const path = require('path');

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
  entry: './src/webview/graph.js',
  output: {
    path: path.resolve(__dirname, 'dist/webview'),
    filename: 'webview.js'
  },
  resolve: {
    extensions: ['.js'],
  },
  devtool: 'nosources-source-map'
};

module.exports = [extensionConfig, webviewConfig];
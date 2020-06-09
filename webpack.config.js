var path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
        "CreateView": "./src/creationView/creation.ts",
        "ResponseView": "./src/responseView/response.ts",
        "DetailView": "./src/resultView/result.ts",
    },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html?$/,
        use: [
            {
            loader: 'file-loader',
            options: {
                name:'[name].[ext]'
            }
          }
        ] 
      }

    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
                // "@actionCommon": path.resolve(__dirname, "../ActionCommon/src"),
                // "@actionSDK": path.resolve(__dirname, "../ActionSDK/src"),
                // "@actionSDK": path.resolve(__dirname, "node_modules/kss-action-sdk/ActionSDK.js"),
            }

  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'output'),
  },
   plugins: [
    new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: 'assets'
      },
      {
        from: 'actionManifest.json'
      },
      {
        from: 'actionModel.json'
      },
      ]),
   ],
   mode: 'development'
  // mode: 'production'//does the minification
};
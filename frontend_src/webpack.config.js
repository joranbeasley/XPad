var path = require('path');

module.exports ={
  entry: './typescript/app.ts',
  output: {
    path: path.resolve(__dirname, '../server/static/_bundle'),
    filename: 'site.bundled.js',
    libraryTarget: 'umd',
    library: 'MyLib',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'awesome-typescript-loader' }
    ]
  }


};
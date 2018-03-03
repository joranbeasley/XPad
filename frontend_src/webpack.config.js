var path = require('path');

module.exports ={
  entry: './typescript_src/app.ts',
  output: {
    path: path.resolve(__dirname, '../server/static/_bundles'),
    filename: 'site.bundled.js',
    libraryTarget: 'umd',
    library: 'MyLib',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias:{
        handlebars: 'handlebars/dist/handlebars.min.js'
    }
  },
  devtool: 'source-map',
  // plugins: [
  //   new webpack.optimize.UglifyJsPlugin({
  //     minimize: true,
  //     sourceMap: true,
  //     include: /\.min\.js$/,
  //   })
  // ],
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'awesome-typescript-loader' },
      { test: /\.hbs/, loader: 'handlebars-loader' }
    ]
  }

  // module: {
  //   loaders: [{
  //     test: /\.tsx?$/,
  //     loader: 'awesome-typescript-loader',
  //     exclude: /node_modules/,
  //     query: {
  //       declaration: false,
  //     }
  //   }
  //   ]
  // }
}
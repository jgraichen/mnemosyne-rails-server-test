//
const merge = require('webpack-merge');
const zopfli = require('@gfx/zopfli');
const CompressionPlugin = require('compression-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = function(env, argv) {
  const common = require('./webpack.common')(env);

  return merge(common, {
    mode: 'production',
    devtool: 'source-map',

    plugins: [
      new MinifyPlugin({}, { test: /\.jsx?$/i }),
      new CompressionPlugin({
        compressionOptions: { numiterations: 15 },
        algorithm: zopfli.gzip,
        test: /\.(js|css|html|json|ico|svg|eot|otf|ttf)$/,
      })
    ]
  });
};

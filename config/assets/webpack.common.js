//
const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackAssetsManifest = require('webpack-assets-manifest');

const root = path.resolve(__dirname, '../../');

module.exports = function(env, argv) {
  return {
    entry: {
      application: ['main.js', 'main.sass'],
      manifest: ['manifest.js']
    },

    context: root,

    output: {
      path: path.join(root, 'public/assets'),
      filename: '[name].[contenthash].js',
      publicPath: env.publicPath
    },

    resolve: {
      modules: [
        path.join(root, 'app/assets'),
        path.join(root, 'node_modules')
      ],
      alias: {
        bourbon: 'bourbon/app/assets/stylesheets'
      },
      extensions: [
        '.coffee', '.js', '.sass', '.scss', '.css', '.png', '.svg', '.jpg'
      ],
    },

    module: {
      rules: [{
        test: /\.(ico|eot|ttf|woff|woff2|jpe?g|png|gif|svg)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: env.dev ? '[path][name].[ext]' : '[name].[contenthash].[ext]',
            publicPath: env.publicPath,
          }
        }]
      }, {
        test: /\.(scss|sass|css)$/i,
        use: [
          MiniCssExtractPlugin.loader,
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: path.join(root, 'tmp/cache/webpack')
          }
        }, {
          loader: 'css-loader',
          options: {
            sourceMap: true,
            importLoaders: 2
          }
        }, {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            plugins: [
              require('postcss-preset-env')(),
              require('cssnano')()
            ]
          }
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }]
      }, {
        test: /\.(jsx?|coffee)$/i,
        use: [{
          loader: 'cache-loader',
          options: {
            cacheDirectory: path.join(root, 'tmp/cache/webpack')
          }
        }, {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,
                loose: true
              }]
            ],
            plugins: [
              ['@babel/plugin-transform-react-jsx', {pragma: 'h'}]
            ]
          },
        }]
      }, {
        test: /\.coffee$/i,
        use: ['coffee-loader'],
        enforce: 'pre'
      }, {
        test: /\.(png|svg|jpg|gif)$/i,
        loader: 'image-webpack-loader',
        enforce: 'pre'
      }]
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css'
      }),
      new WebpackAssetsManifest({
        integrity: true,
        integrityHashes: ['sha384'],
        publicPath: env.publicPath,
        writeToDisk: true,
        customize(entry, original, manifest, asset) {
          if(entry.key == 'manifest.js') {
            // Skip manifest entry point. This file only defines external
            // assets and should not be used otherwise.
            return false
          }

          let modules = manifest.stats.modules.filter((mod) =>
            mod.assets.includes(original.value))

          if(entry.key.endsWith('.map')) {
            // Skip source maps
            return false
          }

          if(modules.length == 0) {
            // This matches entry points that should exported to the manifest
            return entry
          }

          let chunk = manifest.stats.chunks.find((chunk) =>
            chunk.names.includes('manifest'))

          let extmod = modules.find((mod) => mod.chunks.includes(chunk.id))

          if(!extmod) {
            // Dependency of any other bundle e.g. image required in CSS
            // Do not emit a manifest entry for such files
            console.warn('Do not emit ' + original.value)
            return false
          }

          return {
            key: extmod.reasons[0].userRequest,
            value: entry.value
          }
        }
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
    ]
  };
}
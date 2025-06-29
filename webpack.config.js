const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      library: 'ReactThreeInteraction',
      libraryTarget: 'umd',
      globalObject: 'this',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/core': path.resolve(__dirname, 'src/core'),
        '@/tools': path.resolve(__dirname, 'src/tools'),
        '@/views': path.resolve(__dirname, 'src/views'),
        '@/models': path.resolve(__dirname, 'src/models'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...(isProduction ? [] : [
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'examples/public/index.html'),
          filename: 'index.html',
        }),
      ]),
    ],
    externals: isProduction ? {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'three': 'THREE',
    } : {},
    devServer: {
      static: {
        directory: path.join(__dirname, 'examples/public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
}; 
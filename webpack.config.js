const path = require('path');
const Webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    mode: "development",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            name: 'set-piece',
            type: 'umd',
            umdNamedDefine: true
        },
        globalObject: 'this',
        clean: true,
    },
    externals: {
        'react': {
          commonjs: 'react',
          commonjs2: 'react',
          amd: 'react',
          root: 'React'
        },
        'react-dom': {
          commonjs: 'react-dom',
          commonjs2: 'react-dom',
          amd: 'react-dom',
          root: 'ReactDOM'
        }
    },
    devServer: {
        historyApiFallback: true,
        port: 3000,
        open: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.js', '.json', '.ts', '.tsx'],
    },
    optimization: {
        minimize: false,
    },
    module: {
      rules: [
        {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'ts-loader',
            }, 
        },
        {
            test: /\.scss$/,
            use: [
                'style-loader',
                'css-loader',
                'sass-loader'
            ]
        },
        {
            test: /\.(svg|jpg|gif|png)/,
            use: ['file-loader']
        },
      ],
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};

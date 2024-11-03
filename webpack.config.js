const path = require('path');
const Webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin=require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


/** 循环遍历model文件夹 */
function getFileName(dirname) {
    const pathname = path.resolve(__dirname, dirname)
    const filenames = fs.readdirSync(pathname);
    const result = [];
    filenames.forEach(filename => {
        const filePath = `${dirname}/${filename}`;
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            result.push(filePath);
        } else if (stat.isDirectory()) {
            result.push(...getFileName(filePath));
        }
    });
    return result;
}

module.exports = {
    entry: getFileName('./client/model'),
    mode: "development",
    output: {
        filename: 'bundle.[hash:4].js',
        path: path.resolve('dist')
    },
    devServer: {
        historyApiFallback: true,
        port: 3000,
        open: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'client'),
        },
        extensions: ['.js', '.json', '.ts', '.tsx'],
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
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
        },
        {
            test: /\.(svg|jpg|gif|png)/,
            use: ['file-loader']
        },
      ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './client/index.html',
            hash: true,  
        }),
    ]
};

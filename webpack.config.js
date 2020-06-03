const path = require('path');
const nodeExternals = require("webpack-node-externals");

const frontConfig = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    writeToDisk: true,
    contentBase: __dirname,
    compress: true,
    port: 8080,
    hot:true,
    overlay:true
  }
};

const backConfig = {
  entry: "./src/server.ts",
    mode: "development",
    target: "node",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            }
        ]
    },
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    externals: [nodeExternals()]
}

module.exports = [ frontConfig, backConfig ];

// module.exports = {
//   entry: './src/index.ts',
//   mode: 'development',
//   devtool: 'inline-source-map',
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         use: 'ts-loader',
//         exclude: /node_modules/,
//       }
//     ]
//   },
//   resolve: {
//     extensions: [ '.tsx', '.ts', '.js' ],
//   },
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist'),
//   },
//   devServer: {
//     writeToDisk: true,
//     contentBase: __dirname,
//     compress: true,
//     port: 8080,
//     hot:true,
//     overlay:true
//   }
// };

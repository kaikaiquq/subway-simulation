module.exports = {
  // 基本路径
  // publicPath: '/iclient',
  // 构建时的输出目录
  // outputDir: 'dist',
  // 放置静态资源的目录
  // assetsDir: 'static',
  transpileDependencies: ['cesium'],
  devServer: {
    host: 'localhost',
    port: 8081,
    open: true,
    disableHostCheck: true
  },
  // 配置loader
  // configureWebpack: {
  //   module: {
  //     rules: [
  //       {
  //         test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  //         use: {
  //           loader: 'url-loader',
  //           options: {
  //             limit: 10000,
  //             name: 'img/[name].[hash:7].[ext]'
  //           }
  //         }
  //       },
  //       {
  //         test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
  //         use: {
  //           loader: 'url-loader',
  //           options: {
  //             limit: 10000,
  //             name: 'media/[name].[hash:7].[ext]'
  //           }
  //         }
  //       },
  //       {
  //         test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
  //         use: {
  //           loader: 'url-loader',
  //           options: {
  //             limit: 10000,
  //             name: 'fonts/[name].[hash:7].[ext]'
  //           }
  //         }
  //       }
  //     ]
  //   }
  // }
}

# webpack系列（一）使用总结

webpack 是一个模块打包器。webpack 的主要目标是将 **js** 文件打包在一起，打包后的文件用于在浏览器中运行，但它也能够胜任转换(transform)、打包(bundle)或包裹(package)任何资源(resource or asset)。

随着 webpack 不断的发展， webpack 配置变得越来越简单， 构建速度也越来越快，官方文档上说 webpack4 要比 webpack3 构建速度快了 98%， 这还不仅如此，官方表示在 webpack5 中，会使用很多进程构建，进一步优化构建速度。

* Webpack 核心概念
* Webpack 运行原理
* Webpack 调优

## Webpack 核心概念

* 入口(entry)
* 输出(output)
* loader
* 插件(plugins)

### 入口(entry)

入口是 webpack 构建开始的地方，通过入口文件，webpack可以找到入口文件所依赖的文件，并逐步递归，找出所有依赖的文件。
```js
module.exprots = {
    entry: './path/to/my/entry/file.js'    
}
```

### 输出(output)

output属性告诉 webpack 在哪里输出它所创建的 bundle，以及如何命名这些文件。

```js
const path = require('path');
module.exprots = {
    entry: './path/to/my/entry/file.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'my-first-webapck.bundle.js'
    }
}
```

### Loader

webpack 自身只支持 JavaScript。而 Loader 能够让 webpack 处理那些非 JavaScript 文件， 并且先将它们转换为有效的js文件，然后添加到依赖图中，这样就可以供给给应用程序使用。

#### 使用loader

```js
const path = require('path');
module.exprots = {
    entry: './path/to/my/entry/file.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'my-first-webapck.bundle.js'
    },
    modules: {
        rules: [
            {
                //根据后缀名匹配需要处理的文件
                test: /\.txt$/,
                //使用对应的loader处理文件
                loader: 'raw-loader'
            }     
        ]   
    }
}
```

#### 编写loader

其实 loader 就是一个 function，接受一个参数 source，就是当前文件的内容，然后稍加处理，就可以 return 出一个新的文件内容

```js
const loaderUtils = require('loader-utils');
module.exprots = function(source) {
    //获取loader中传递的配置信息
    const options = loaderUtils.getOptions(this);
    this.callback(null,'/*增加一个注释*/'+ source);
    //也可以直接 return
    // return "/ *增加一个注释 */" + source;
}
```

### 插件(plugins)

插件其实就是一个类，通过监听 webpack 执行流程上的钩子函数，可以更精密地控制 webpack 的输出，包括：打包优化、资源管理和环境变量等。

#### 使用插件

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exprots = {
    module: {
        rules: [{ test: /\.txt$/, use: 'raw-loader' }],
        plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })]
    }
}
```

#### 编写插件

我们可以利用 webpack 提供的钩子函数，编写自定义插件， 相当于监听 webpack 的事件，作出对应的响应， webpack是通过 [Tapable](https://github.com/webpack/tapable) 进行事件流管理。

```js
class APlugin {
    //apply 方法，会在new plugin 后被 webpack 自动执行。
    apply(compiler){
        //可以在任意的钩子函数中去触发自定义事件，也可以监听其他事件：compiler.hooks.xxxx
        compiler.hooks.compilation.tap('APlugin', compilation => {
            compilation.hooks.afterOptimizeChunkAssets.tap('APlugin', chunks => {
                //   这里只是简单的打印了chunks，你如果有更多的想法，都可以在这里实现。
                console.log('打印chunks：', chunks);
            });
        })
    }
}
```

## Webpack 运行原理

webpack 在运行时大致分为这几个阶段：

1、读取 webpack.config.js 配置文件， 生成 compiler 实例，并把 compiler 实例注入 plugin 中的apply 方法中。

2、读取配置的 Entries，递归遍历所有的入口文件。

3、对入口文件进行编译，开始 compilation 过程，使用 loader 对文件内容编译，再将编译好的文件内容解析成 AST 静态语法树。 

4、递归依赖的模块，重复第三部，生成 AST 语法树，在 AST 语法树中可以分析到模块之间的依赖关系，对应做出优化。

5、将所有模块中的 require 语法替换成 `_webpack_require_` 来模拟模块化操作。

6、最后把所有的模块打包进一个自执行函数（IIFE）中。

### 流程图

![webpack 运行流程图](devops-webpack-steps.jpg)


## Webpack 调优

在 webpack4 发布后，相比 webpack3 的构建进行了高效的优化，速度提高了 98%，一些常规优化 webapck 都已经帮我们做了，使得 webpack 变得越来越简单，甚至可以达到零配置，但是对于零配置而言，不能满足全部需求所以还是建议进行手动配置。

### 使用 mode 配置项

最懒人的写法， 在 webpack 配置项中 mode = production，webpack 就帮我们把常用的配置都配置好了，而且完全可以胜任大部分需求。

```js 
module.exports = {
    mode: 'production'
}
```
使用该配置后，webpack 会将 process.env.NODE_ENV 的值设置为 production。

并且还会帮我们配置好一下插件：

1. FlagDependencyUsagePlugin （标记没有用到的依赖）
2. flagIncludedChunksPlugin (标记用到的依赖)
3. ModuleConcatenationPlugin (scope hoisting)
4. NoEmitOnErrorsPlugin (遇到错误代码不跳出)
5. OccurrenceOrderPlugin (给生成的chunkId排序)
6. uglifyjs-webpack-plugin (压缩)

### 拆分文件

如果不拆分文件， webpack 会把所有文件都打包在一个js文件中，这个文件会变得非常大，我们可以配置 optimization.splitChunks 来拆分文件。

这是 webpack 默认的配置，也可以根据自己需求做对应修改：

```js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'async', // 参数可能是：all，async和initial，这里表示拆分异步模块。
      minSize: 30000, // 如果模块的大小大于30kb，才会被拆分
      minChunks: 1,
      maxAsyncRequests: 5, // 按需加载时最大的请求数，意思就是说，如果拆得很小，就会超过这个值，限制拆分的数量。
      maxInitialRequests: 3, // 入口处的最大请求数
      automaticNameDelimiter: '~', // webpack将使用块的名称和名称生成名称（例如vendors~main.js）
      name: true, // 拆分块的名称
      cacheGroups: {
        // 缓存splitchunks
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2, // 一个模块至少出现2次引用时，才会被拆分
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### 使用Happypack

纵观 webpack 构建流程，我们可以发现整个构建过程主要花费时间的部分也就是递归遍历各个 entry 然后寻找依赖逐个编译的过程，每次递归都需要经历 string -> ast -> string 的流程，经过
loader还需要处理一些字符串或者执行一些js脚本介于node.js单线程的壁垒， webpack构建慢一直成为它饱受诟病的原因。 **HappyPack 可以将 Loader 的同步执行转换为并行的**，这样就能充分利用系统资源来加快打包速率。

```js
// @file: webpack.config.js
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 5 });

module.exports = {
  // ...
  plugins: [
    new HappyPack({
      id: 'jsx',
      threadPool: happyThreadPool,
      loaders: ['babel-loader']
    }),

    new HappyPack({
      id: 'styles',
      threadPool: happyThreadPool,
      loaders: ['style-loader', 'css-loader', 'less-loader']
    })
  ]
};

exports.module.rules = [
  {
    test: /\.js$/,
    use: 'happypack/loader?id=jsx'
  },

  {
    test: /\.less$/,
    use: 'happypack/loader?id=styles'
  }
];
```

### 使用DllPlugin

**DllPlugin 可以将特定的累哭提前打包然后引入。** 这种方式可以极大减少打包类库的次数，只有当类库更新版本才有需要重新打包，并且也实现了将公共代码抽离成单独文件的优化方案。

* Dllplugin：用于打包单独的动态链接文件
* DllReferencePlugin：用于在主要的配置文件中引入 DllPlugin 插件打包好的动态链接库文件。

这里需要 2 个配置文件，先执行 webpack.dll.config.js，生成 mainfest, 然后再执行 webpack.config.js 打包文件。

动态链接库配置：

```js {5,12,13,14,15}
  // webpack.dll.config.js
  // 这里配置DllPlugin，生成mainifest
  module.exports = {
    entry:{
        // 将react相关，放入一个单独的动态链接库中
        react:['react','react-dom']
    },
    output:{
        filename:'[name].dll.js'
    },
    plugins:[
      new webpack.DllPlugin({
          name: '_dll_[name]',
          path: path.join(__dirname, '[name].manifest.json'),
      );
    ]
  };
```
使用打包后的动态链接库：

```js {5,6,7}
// webpack.config.js
// 这里配置DllPlugin，生成mainifest
module.exports = {
  plugins:[
    new webpack.DllReferencePlugin({
        manifest: require('./react.manifest.json')
    });
  ]
};
```

### 其他优化方法

#### 常规优化

1、在处理 `loader` 时，配置 `include`,缩小 `loader` 检查范围。
2、使用 `alias` 可以更快的找到对应文件。
3、如果在 `require` 模块时不写后缀名，默认webpack会尝试 `.js`,`.json` 等后缀名匹配， 配置 `extensions`, 可以让 webpack 少多一点后缀匹配。
4、`thread-loader` 可以将非常消耗资源的 loaders 转存到 worker pool 中。
5、使用 `cache-loader` 启用持久化缓存。 使用package.json中的 postinstall 清楚缓存目录。
6、使用 mode 中的 `noParse` 属性，可以设置不必要的依赖解析，例如：我们知道lodash时无任何依赖包的，就可以设置此选项，缩小文件解析范围。
7、导出打包的统计文件，使用分析工具进行分析 `webpack --profile --json > stat.json`。

#### 开发环境优化

1、选择合理 devtool，在大多数情况下， `cheap-module-evel-source-map` 时最好的选择。
2、注意设置 mode，开发阶段一般不需要进行压缩合并，提取单独文件等操作。
3、webapck会在输出文件中生成路径信息注释。可以在 `options.output.pathInfo` 设置中关闭注释。
4、在开发阶段，可以直接引用 cdn 上的库文件，使用 `externals` 配置全剧对象，避免打包。

#### 生产环境优化

1、静态资源上cdn。
2、使用 `tree shaking`, 只打包用到的模块，删除没有用到的模块。
3、配置 `scope hoisting`作用域提升，将多个IIFE放在一个IIFE中。

相关代码如下：

```js
module.exports = {
  output: {
    // 静态资源上cdn
    publicPath: '//xxx/cdn.com',
    // 不生成「所包含模块信息」的相关注释
    pathinfo: false
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader',
        // 缩小loader检查范围
        include: path.join(__dirname, 'src')
      }
    ]
  },
  plugins: [
    // 开启scope hoisting
    new ModuleConcatenationPlugin()
  ],
  resolve: {
    // 使用别名，加快搜索
    alias: {
      '~': path.resolve(__dirname, '../src')
    },
    // 配置用到的后缀名，方便webpack查找
    extensions: ['js', 'css']
  },
  // 开发阶段引用cdn上文件，可以避免打包库文件
  externals: {
    vue: 'Vue',
    'element-ui': 'ELEMENT'
  }
};
```
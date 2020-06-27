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

# Webpack系列（二）手写模块打包代码

最近在学习 webpack，参考官网的 demo，编写了一个简版的模块加载器，对webpack的运行流程有了一个新的认识。

* Webpack打包后文件分析
* 手写一个模块打包器

## Webpack 打包后文件分析

为了更好的理解 webpack 模块打包机制，我们先来看一下 webpack 打包后的文件。

```js
(function(modules) {
  function __webpack_require__(moduleId) {
    var module = {
      exports: {}
    };
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    return module.exports;
  }
  return __webpack_require__('./example/entry.js');
})({
  './example/entry.js': function(
    module,
    __webpack_exports__,
    __webpack_require__
  ) {
    // code...
  }
});
```
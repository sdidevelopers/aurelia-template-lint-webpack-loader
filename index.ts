/// <reference path="./node_modules/webpack-dependency-suite/custom_typings/webpack.d.ts" />
/// <reference path="./node_modules/webpack-dependency-suite/custom_typings/any.d.ts" />
import * as SourceMap from 'source-map'
import * as loaderUtils from 'loader-utils'
import {AureliaLinter, Config} from 'aurelia-template-lint-sdi'
import {AureliaTemplateLintLoaderOptions} from './typings'
import * as path from 'path'

async function lint(input: string, loaderInstance: Webpack.Core.LoaderContext) {
  const options = Object.assign({}, (loaderUtils as any).getOptions(loaderInstance)) as AureliaTemplateLintLoaderOptions

  if (!options.configuration) {
    options.configuration = new Config()
  }

  // Configure linter
  if (options.typeChecking) {
    if (!options.configuration.useRuleAureliaBindingAccess) {
      options.configuration.useRuleAureliaBindingAccess = true
    }
    if (options.reflectionOpts) {
      options.configuration.reflectionOpts = options.reflectionOpts
    }
  }

  options.rootDir = options.rootDir || (loaderInstance as any).rootContext

  const linter = new AureliaLinter(options.configuration)

  // Lint current file
  const results = await linter.lint(input, options.rootDir ? `./${path.relative(options.rootDir, loaderInstance.resourcePath)}` : loaderInstance.resourcePath)

  // Choose the right emitter
  const emitter = options.emitErrors ? loaderInstance.emitError : loaderInstance.emitWarning

  let errorText = '';

  // Loop over results if any
  results.forEach(error => {
    // Setup error message
    errorText += `[${error.line}, ${error.column}]: ${error.message}\r\n`;
  })

  if (results && results.length > 0) {
    // Emit error message
    emitter(errorText)
  }
}

function loader(this: Webpack.Core.LoaderContext, input: string, sourceMap?: SourceMap.RawSourceMap) {
  this.cacheable && this.cacheable()
  const callback = this.async()

  if (!callback) {
    // sync
    lint(input, this).catch(error => console.error(error.message))
    return input
  } else {
    // async
    lint(input, this).then(() => callback(undefined, input, sourceMap)).catch(callback)
  }
}


module.exports = loader

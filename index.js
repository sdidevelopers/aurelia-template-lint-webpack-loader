/// <reference path="./node_modules/webpack-dependency-suite/custom_typings/webpack.d.ts" />
/// <reference path="./node_modules/webpack-dependency-suite/custom_typings/any.d.ts" />
import * as SourceMap from 'source-map'
import * as loaderUtils from 'loader-utils'
import {AureliaLinter, Config} from 'aurelia-template-lint'
import {AureliaTemplateLintLoaderOptions} from './typings'

async function lint(input: string, loaderInstance: Webpack.Core.LoaderContext) {
  const config = Object.assign({}, loaderUtils.parseQuery(this.query)) as AureliaTemplateLintLoaderOptions

  // Get bail option
  const bailEnabled = loaderInstance.options.bail === true

  if (!config.configuration) {
    config.configuration = new Config()
  }

  // Configure linter
  if (config.typeChecking) {
    config.configuration.useRuleAureliaBindingAccess = true
    config.configuration.reflectionOpts = {
      sourceFileGlob: `${config.fileGlob}/**/*.ts`,
      typingsFileGlob: `${config.fileGlob}/**/*.d.ts`
    }
  }

  const linter = new AureliaLinter(config.configuration)

  // Lint current file
  const results = await linter.lint(input, loaderInstance.resourcePath)

  // Choose the right emitter
  const emitter = config.emitErrors ? loaderInstance.emitError : loaderInstance.emitWarning

  let errorText = '';

  // Loop over results if any
  results.forEach(error => {
    // Setup error message
    errorText += `[${error.line}, ${error.column}]: ${error.message}\r\n`;
  })

  if (results && results.length > 0) {
    // Emit error message
    emitter(errorText)

    // Fail on hint
    if (config.failOnHint) {
      const messages = bailEnabled ? '\n\n' + loaderInstance.resourcePath + '\n' + errorText : ''
      throw new Error('Compilation failed due to aurelia template error errors.' + messages)
    }
  }
}

function loader(this: Webpack.Core.LoaderContext, input: string, sourceMap?: SourceMap.RawSourceMap) {
  this.cacheable && this.cacheable()
  const callback = this.async()

  if (!callback) {
    // sync
    lint(input, this)
    return input
  } else {
    // async
    lint(input, this).then(() => callback(), callback)
  }
}

module.exports = loader

import {Config} from 'aurelia-template-lint-sdi'

export interface AureliaTemplateLintLoaderOptions {
  typeChecking?: boolean
  configuration?: Config
  reflectionOpts?: typeof Config.prototype.reflectionOpts
  emitErrors?: boolean
  failOnHint?: boolean
  rootDir?: string
}

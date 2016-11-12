import {Config} from 'aurelia-template-lint'

export interface AureliaTemplateLintLoaderOptions {
  typeChecking?: boolean
  configuration?: Config
  fileGlob?: string
  emitErrors?: boolean
  failOnHint?: boolean
}

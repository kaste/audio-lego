import babel from 'rollup-plugin-babel'
import {resolve} from 'path'


export default {
  format: 'iife',
  external: [
    resolve('./Pony/decorators.js')
  ],
  globals: {
    './Pony/decorators.js': 'Pony.decorators'
  },
  plugins: [ babel() ]
}
const adobeConfig = require('@adobe/eslint-config-aio-lib-config')

module.exports = [
  ...adobeConfig,
  {
    ignores: ['node_modules/', 'dist/', 'build/']
  }
]

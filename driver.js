const path = require('path');
const { Driver } = require('zwave-js');

module.exports.createDriver = (input, keysFile, { debug = false } = {}) => {
  // TODO: Generate keys if not found.

  const keys = require(path.resolve(process.cwd(), keysFile));

  const driver = new Driver(input, {
    storage: {
      cacheDir: path.resolve(path.resolve(process.cwd(), 'cache')),
    },
    securityKeys: {
      S2_Unauthenticated: Buffer.from(keys.s2.unauthenticated, 'hex'),
      S2_Authenticated: Buffer.from(keys.s2.authenticated, 'hex'),
      S2_AccessControl: Buffer.from(keys.s2.accessControl, 'hex'),
      // S0_Legacy replaces the old networkKey option.
      S0_Legacy: Buffer.from(keys.s0.legacy, 'hex'),
    },
    logConfig: {
      enable: debug,
      level: debug ? 'debug' : 'error',
    },
  });

  return driver;
};

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_PATH = './keys.json';

module.exports.generateSync = ({ save = false, encoding = 'hex' } = {}) => {
  const keys = {
    s2: {
      accessControl: crypto.randomBytes(16).toString(encoding),
      authenticated: crypto.randomBytes(16).toString(encoding),
      unauthenticated: crypto.randomBytes(16).toString(encoding),
    },
    s0: {
      legacy: crypto.randomBytes(16).toString(encoding),
    },
  };

  if (save) {
    const keysAbsolutePath = path.resolve(__dirname, KEYS_PATH);
    if (!fs.existsSync(keysAbsolutePath)) {
      fs.writeFileSync(keysAbsolutePath, JSON.stringify(keys, ' ', 2));
    }
  }

  return keys;
};

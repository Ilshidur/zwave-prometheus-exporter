module.exports = () => {
  const { generateSync } = require('../crypto');

  generateSync({ save: true });
};

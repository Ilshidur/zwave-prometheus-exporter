const { createDriver } = require('../driver');

module.exports = (commandOptions, command) => {
  const options = { ...command.parent.opts(), ...commandOptions };

  const driver = createDriver(options.input, options.keys, { debug: options.debug });

  driver.on('error', (err) => {
    console.error(err);

    // TODO: If err.code === 5 || err.message.includes('The serial port close unexpectedly!')
    // Prevent exporting.
  });

  driver.once('driver ready', () => {
    driver.controller.nodes.forEach((node) => {
      const data = {
        id: node.id || '<unknown>',
        controller: node.isControllerNode() ? 'yes' : 'no',
        awake: node.isAwake ? 'yes' : 'no',
        location: node.location || '<unknown>',
        listening: node.isListening ? 'yes' : 'no',
        routing: node.isRouting ? 'yes' : 'no',
        rates: node.supportedDataRates || '<unknown>',
        security: node.getHighestSecurityClass() || '<unknown>',
        firmware: node.firmwareVersion || '<unknown>',
        'manufacturer id': node.manufacturerId ? `0x${node.manufacturerId.toString(16).padStart(2, '0')}` : '<unknown>',
        'product id': node.productId ? `0x${node.productId.toString(16).padStart(2, '0')}` : '<unknown>',
        'product type': node.productType ? `0x${node.productType.toString(16).padStart(2, '0')}` : '<unknown>',
      };
      console.log(Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', '));
      // console.log(node);
    });
    process.exit(0);
  });

  (async () => {
    try {
      await driver.start();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }

    let shuttingDown = false;
    process.on('SIGINT', async () => {
      if (!shuttingDown) {
        shuttingDown = true;
        console.log('Destroying...');
        await driver.destroy();
      } else {
        console.log('Killing...');
        process.exit(1);
      }
    });
  })();
};

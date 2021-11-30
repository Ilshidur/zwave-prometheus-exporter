const { InclusionStrategy } = require('zwave-js');
const { createDriver } = require('../driver');

module.exports = (commandOptions, command) => {
  const options = { ...command.parent.opts(), ...commandOptions };

  const driver = createDriver(options.input, options.keys, { debug: options.debug });

  driver.on('error', (err) => {
    console.error(err);

    // TODO: If err.code === 5 || err.message.includes('The serial port close unexpectedly!')
    // Prevent exporting.
  });

  driver.once('driver ready', async () => {
    try {
      await driver.controller.beginExclusion({
        strategy: InclusionStrategy.Default,
        userCallbacks: {
          /**
           * Instruct the application to display the user which security classes the device has requested and whether client-side authentication (CSA) is desired.
           * The returned promise MUST resolve to the user selection - which of the requested security classes have been granted and whether CSA was allowed.
           * If the user did not accept the requested security classes, the promise MUST resolve to `true`.
           * @returns {Promise<InclusionGrant | false>} grant
           */
          grantSecurityClasses(requested) {
            console.log('grantSecurityClasses', requested);
            // Show a dialog that asks the user which security classes to grant
            // Return a Promise that resolves to the chosen security classes when confirmed
            //
            // YOUR IMPLEMENTATION HERE
          },
          /**
           * Instruct the application to display the received DSK for the user to verify if it matches the one belonging to the device and
           * additionally enter the PIN that's found on the device.
           * The returned promise MUST resolve to the 5-digit PIN (as a string) when the user has confirmed the DSK and entered the PIN and `false` otherwise.*
           * @param dsk The partial DSK in the form `-bbbbb-ccccc-ddddd-eeeee-fffff-11111-22222`. The first 5 characters are left out because they are the unknown PIN.
           * @returns {Promise<string | false>} grant
           */
          validateDSKAndEnterPIN(dsk) {
            console.log('validateDSKAndEnterPIN', dsk);
            // Show a dialog that asks the user to validate the DSK and enter the device PIN
            // Return a Promise that resolves to the entered PIN when confirmed
            //
            // YOUR IMPLEMENTATION HERE
          },
          /** Called by the driver when the user validation has timed out and needs to be aborted */
          abort() {
            console.log('abort');
            // Hide the open dialog, notify user that the process was aborted
            //
            // YOUR IMPLEMENTATION HERE
          },
        },
      });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }

    console.log('Inclusion...');
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

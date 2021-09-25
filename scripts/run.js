const http = require('http');
const path = require('path');
const { Driver, InclusionStrategy } = require('zwave-js');

const PrometheusMetric = require('../metric');

const package = require('../package.json');
const keys = require('../keys.json');
const monitoredMetrics = require('../metrics.json');

const prometheusMetrics = {};

const [,, serialPortPath = '/dev/ttyUSB0', port = 9850] = process.argv;

const driver = new Driver(serialPortPath, {
  storage: {
    cacheDir: path.resolve(__dirname, 'cache'),
  },
  securityKeys: {
    S2_Unauthenticated: Buffer.from(keys.s2.unauthenticated, 'hex'),
    S2_Authenticated: Buffer.from(keys.s2.authenticated, 'hex'),
    S2_AccessControl: Buffer.from(keys.s2.accessControl, 'hex'),
    // S0_Legacy replaces the old networkKey option.
    S0_Legacy: Buffer.from(keys.s0.legacy, 'hex'),
  },
  logConfig: {
    enable: true,
    level: 'info',
  },
});

driver.on('error', (err) => {
  console.error(err);
});

driver.once('driver ready', () => {
  driver.controller.nodes.forEach(async (node) => {
    node.once('ready', async () => {
      console.log(`[#${node.id}] Node ready. Name : #${node.name || '<NO NAME>'}.`);

      if (!node.commandClasses.Basic.isSupported()) {
        console.log(`[#${node.id}] Basic CC API not supported.`);
        return;
      }
      // 'Qubino Smart Plug 16A'
      try {
        // console.log('Value', await node.getValue({
        //   commandClass: 0x32,
        //   property: 'value',
        //   propertyKey: 66049,
        // }));
        console.log('test', await node.getDefinedValueIDs());
      } catch (err) {
        console.error(err);
      }
    });

    node.on('value updated', (_, value) => {
      // console.log(`#${node.id} value updated`, value);

      const matchingMetric = monitoredMetrics
        .find((metricToMonitor) =>
          Number(metricToMonitor.commandClass) === value.commandClass &&
          metricToMonitor.property === value.property &&
          Number(metricToMonitor.propertyKey) === value.propertyKey);
      if (matchingMetric) {
        const metric = new PrometheusMetric(matchingMetric.name, node.id, value.newValue);
        prometheusMetrics[metric.hash] = metric;
      }
    });

    // try {
    //   await driver.controller.beginInclusion({
    //     strategy: InclusionStrategy.Default,
    //     userCallbacks: {
    //       grantSecurityClasses(requested) {
    //         console.log(requested);
    //         // Show a dialog that asks the user which security classes to grant
    //         // Return a Promise that resolves to the chosen security classes when confirmed
    //         //
    //         // YOUR IMPLEMENTATION HERE
    //       },
    //       validateDSKAndEnterPIN(dsk) {
    //         console.log(dsk);
    //         // Show a dialog that asks the user to validate the DSK and enter the device PIN
    //         // Return a Promise that resolves to the entered PIN when confirmed
    //         //
    //         // YOUR IMPLEMENTATION HERE
    //       },
    //       abort() {
    //         console.log('Abort');
    //         // Hide the open dialog, notify user that the process was aborted
    //         //
    //         // YOUR IMPLEMENTATION HERE
    //       },
    //     },
    //   });
    // } catch (err) {
    //   console.error(err);
    // }
  });

  driver.controller.once('node added', (node, { lowSecurity }) => {
    console.log(`[#${node.id}] Added node. Secure : ${lowSecurity}.`);
  });
});

(async () => {
  try {
    // TODO: Enable once the project is finished.
    // driver.enableStatistics({ applicationName: package.name, applicationVersion: package.version })
    await driver.start();
    console.log('Z wave driver started.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    if (req.url !== '/metrics' || req.method !== 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(Object.values(prometheusMetrics).map(metric => metric.toString()).sort().join('\n'));
  });

  process.on('SIGINT', async () => {
    console.log('Destroying...');
    server.close();
    await driver.destroy();
  });

  server.listen(port);
  console.log(`Listening on port ${port}...`);
})();

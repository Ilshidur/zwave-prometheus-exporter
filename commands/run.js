const http = require('http');
const path = require('path');
const { Driver } = require('zwave-js');

const PrometheusMetric = require('../metric');

module.exports = (options) => {
  const keys = require('../keys.json');
  const monitoredMetrics = require('../metrics.json');

  const prometheusMetrics = {};

  const driver = new Driver(options.input, {
    storage: {
      cacheDir: path.resolve(__dirname, '..', 'cache'),
    },
    securityKeys: {
      S2_Unauthenticated: Buffer.from(keys.s2.unauthenticated, 'hex'),
      S2_Authenticated: Buffer.from(keys.s2.authenticated, 'hex'),
      S2_AccessControl: Buffer.from(keys.s2.accessControl, 'hex'),
      // S0_Legacy replaces the old networkKey option.
      S0_Legacy: Buffer.from(keys.s0.legacy, 'hex'),
    },
    logConfig: {
      enable: false,
      level: 'error',
    },
  });

  driver.on('error', (err) => {
    console.error(err);
  });

  driver.once('driver ready', () => {
    driver.controller.nodes.forEach(async (node) => {
      node.on('value updated', (_, value) => {
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
    });
  });

  (async () => {
    try {
      await driver.start();
      console.log('Z-Wave driver started.');
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

    server.listen(options.port);
    console.log(`Listening on port ${options.port}...`);
  })();
};

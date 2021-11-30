const fs = require('fs');
const http = require('http');
const path = require('path');

const { createDriver } = require('../driver');
const PrometheusMetric = require('../metric');

module.exports = (port, commandOptions, command) => {
  const options = { ...command.parent.opts(), ...commandOptions };

  // const monitoredMetrics = require(path.resolve(process.cwd(), options.metrics));
  const monitoredMetricsPath = path.resolve(process.cwd(), options.metrics);
  if (!fs.existsSync(monitoredMetricsPath)) {
    console.error(`Metrics file ${monitoredMetricsPath} doesn't exist.`);
    process.exit(1);
  }

  let rawMonitoredMetrics;
  try {
    rawMonitoredMetrics = fs.readFileSync(monitoredMetricsPath);
  } catch (err) {
    console.error(`Could not open the file ${monitoredMetricsPath} :`);
    console.error(err.message);
    process.exit(1);
  }

  let monitoredMetrics;
  try {
    monitoredMetrics = JSON.parse(rawMonitoredMetrics);
  } catch (err) {
    console.error(`Could not parse the file ${monitoredMetricsPath} :`);
    console.error(err.message);
    process.exit(1);
  }

  const driver = createDriver(options.input, options.keys, { debug: options.debug });
  const prometheusMetrics = {};

  driver.on('error', (err) => {
    console.error(err);

    // TODO: If err.code === 5 || err.message.includes('The serial port close unexpectedly!')
    // Prevent exporting.
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

    let shuttingDown = false;
    process.on('SIGINT', async () => {
      if (!shuttingDown) {
        shuttingDown = true;
        console.log('Destroying...');
        server.close();
        await driver.destroy();
      } else {
        console.log('Killing...');
        process.exit(1);
      }
    });

    server.listen(port);
    console.log(`Listening on port ${port}...`);
  })();
};

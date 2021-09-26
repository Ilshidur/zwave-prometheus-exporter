#!/usr/bin/env node

const { Command } = require('commander');

const run = require('./commands/run');

const package = require('./package.json');

const program = new Command();
program
  .version(package.version)
  .name(package.name)
  .usage('')
  .option('-k, --keys <keys path>', 'the keys file path', 'keys.json')
  .option('-m, --metrics <metrics path>', 'the metrics file path', 'metrics.json')
  .option('-i, --input <input path>', 'the serial port file path', '/dev/ttyUSB0')
  .option('-p, --port <port>', 'the port where the prometheus metrics will be exposed', 9850)
  .action(run)
  .parse(process.argv);

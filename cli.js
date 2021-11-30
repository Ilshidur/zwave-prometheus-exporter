#!/usr/bin/env node

const { Command, Option } = require('commander');

const add = require('./commands/add');
const expose = require('./commands/expose');
const list = require('./commands/list');

const package = require('./package.json');

const program = new Command();
program
  .version(package.version)
  .name(package.name)
  .description(`${package.description}\nSee more @ ${package.homepage}.`)
  .usage('')
  .option('-k, --keys <keys path>', 'the keys file path, they will be generated if not found', 'keys.json')
  .option('-m, --metrics <metrics path>', 'the metrics file path', 'metrics.json')
  .option('-i, --input <input path>', 'the serial port file path', '/dev/ttyUSB0')
  .option('-d, --debug', 'debug mode with detailed logs', false)

  // TODO: Support this.
  .option('--enable-statistics', 'enable stats reporting to Z-Wave JS');

program
  .command('expose')
  .description('starts listening to z-wave nodes in the network and expose them as prometheus metrics on the given port')
  .argument('[port]', 'the port where the prometheus metrics will be exposed', 9850)
  .action(expose);

program
  .command('list')
  .description('list all z-wave nodes in the network')
  .action(list);

program
  .command('add')
  .description('include a z-wave node in the network')
  .action(add);

program.parse();

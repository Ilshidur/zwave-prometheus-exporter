# ⚡ zwave-prometheus-exporter

![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)

[![npm version][version-badge]][version-url]
[![Known Vulnerabilities][vulnerabilities-badge]][vulnerabilities-url]
[![dependency status][dependency-badge]][dependency-url]
[![devdependency status][devdependency-badge]][devdependency-url]
[![Code Climate][maintainability-badge]][maintainability-url]
[![downloads][downloads-badge]][downloads-url]

[![NPM][npm-stats-badge]][npm-stats-url]

[![dockeri.co](https://dockeri.co/image/ilshidur/zwave-prometheus-exporter)](https://hub.docker.com/r/ilshidur/zwave-prometheus-exporter)

Listens to Z-Wave nodes and exports Prometheus metrics.

## ⚡ Installation

### Using Docker

```bash
docker run \
  -p 9850:9850 \
  -v $(pwd)/metrics.json:/home/app/metrics.json \
  -v $(pwd)/keys.json:/home/app/keys.json \
  --device=/dev/ttyUSB0:/dev/ttyUSB0 \
  --name zwave-prometheus-exporter \
  --rm \
  ilshidur/zwave-prometheus-exporter
```

### As a global npm module

**Node.js required.**

```bash
npm i -g zwave-prometheus-exporter
zwave-prometheus-exporter
```

### By cloning the git project

**Node.js required.**

```bash
git clone https://github.com/Ilshidur/zwave-prometheus-exporter.git
npm ci
node cli.js
```

## ⚡ Usage

```
Usage: zwave-prometheus-exporter [options]

Options:
  -V, --version                 output the version number
  -k, --keys <keys path>        the keys file path (default: "keys.json")
  -m, --metrics <metrics path>  the metrics file path (default: "metrics.json")
  -i, --input <input path>      the serial port file path (default: "/dev/ttyUSB0")
  -p, --port <port>             the port where the prometheus metrics will be exposed (default: 9850)
  -h, --help                    display help for command
```

## ⚡ Configuration files

The CLI needs 2 files to run : `metrics.json` and `keys.json`. If no path is provided, the CLI will try to load `zwave-prometheus-exporter/metrics.json` and `zwave-prometheus-exporter/keys.json`.

**Those 2 files are required for the CLI to run.**

### `metrics.json`

This file contains the Z-Wave values to monitor and export as Prometheus metrics.

**Each field being :**

* **`name`** : the name with which this Z-Wave value will be exposed as a Prometheus metric.
* **`commandClass`** : the Command Class of the value to export.
* **`property`** : the Command Class property of the value to export.
* **`propertyKey`** : the Command Class property key of the value to export.

```json
[
  {
    "name": "power_consumption_watts",
    "commandClass": "0x32",
    "property": "value",
    "propertyKey": 66049
  },
  {
    "name": "power_consumption_volts",
    "commandClass": "0x32",
    "property": "value",
    "propertyKey": 66561
  },
  {
    "name": "power_consumption_amperes",
    "commandClass": "0x32",
    "property": "value",
    "propertyKey": 66817
  }
]
```

### `keys.json`

This file contains the Z-Wave keys used to communicate securely with the Z-Wave nodes. Each key is a 32 hex caracters length with different content. Sharing keys between multiple security classes is a security risk!

> *You can find more details on the [Z-Wave JS docs](https://zwave-js.github.io/node-zwave-js/#/getting-started/security-s2).*

```json
{
  "s2": {
    "accessControl": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "authenticated": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "unauthenticated": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  },
  "s0": {
    "legacy": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
}
```

## ⚡ TODO

* Process to securely add a node into the Z-Wave network.

<hr/>

<p align="center">
  Don't forget to 🌟 Star 🌟 the repo if you like this project !<br/>
  <a href="https://github.com/Ilshidur/zwave-prometheus-exporter/issues/new">Your feedback is appreciated</a>
</p>

[version-badge]: https://img.shields.io/npm/v/zwave-prometheus-exporter.svg
[version-url]: https://www.npmjs.com/package/zwave-prometheus-exporter
[vulnerabilities-badge]: https://snyk.io/test/npm/zwave-prometheus-exporter/badge.svg
[vulnerabilities-url]: https://snyk.io/test/npm/zwave-prometheus-exporter
[dependency-badge]: https://david-dm.org/ilshidur/zwave-prometheus-exporter.svg
[dependency-url]: https://david-dm.org/ilshidur/zwave-prometheus-exporter
[devdependency-badge]: https://david-dm.org/ilshidur/zwave-prometheus-exporter/dev-status.svg
[devdependency-url]: https://david-dm.org/ilshidur/zwave-prometheus-exporter#info=devDependencies
[build-badge]: https://travis-ci.org/Ilshidur/zwave-prometheus-exporter.svg
[build-url]: https://travis-ci.org/Ilshidur/zwave-prometheus-exporter
[maintainability-badge]: https://api.codeclimate.com/v1/badges/1460cc66adbf6478806d/maintainability
[maintainability-url]: https://codeclimate.com/github/Ilshidur/zwave-prometheus-exporter/maintainability
[downloads-badge]: https://img.shields.io/npm/dt/zwave-prometheus-exporter.svg
[downloads-url]: https://www.npmjs.com/package/zwave-prometheus-exporter
[npm-stats-badge]: https://nodei.co/npm/zwave-prometheus-exporter.png?downloads=true&downloadRank=true
[npm-stats-url]: https://nodei.co/npm/zwave-prometheus-exporter

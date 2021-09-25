const METRICS_PREFIX = 'zwave_';

module.exports = class PrometheusMetric {
  constructor(name, nodeId, value) {
    this.name = name;
    this.nodeId = nodeId;
    this.value = value;
  }

  get hash() {
    return `${this.name}@@${this.nodeId}`;
  }

  toString() {
    return `${METRICS_PREFIX}${this.name.toLowerCase()}{node=${this.nodeId}} ${this.value}`;
  }
};

#!/usr/bin/env node

const { generateSync } = require('../crypto');

generateSync({ save: true });

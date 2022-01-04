const path = require('path');
const {process} = require('./index');

const source = path.join(__dirname, 'svg');
const output = path.join(__dirname, 'output');

process(source, output);

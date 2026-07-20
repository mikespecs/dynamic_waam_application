const { materials } = require('./materials.json');
const v8 = require('node:v8');

console.log(v8.getHeapSnapshot());

const lc = require('./leetCode');
var argv = require('minimist')(process.argv.slice(2));
console.log(argv)

lc.leetcode(argv)
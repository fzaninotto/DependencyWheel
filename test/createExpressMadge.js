var madge = require('madge');

var dependencies = madge('./express-master/', {exclude: '^examples*|^test*'}).tree;

console.log(JSON.stringify(dependencies));
"use strict";

var UglifyJS = require('uglify-js'),
    fs = require('fs'),
    pkgInfo = require('./package.json'),
    sourceFile = __dirname + '/js/' + pkgInfo.main.replace('dist/', ''),
    targetFile = __dirname + '/' + pkgInfo.main,
    targetMinFile = __dirname + '/' + pkgInfo.main.replace(/.js$/, '') + '.min.js',
    source = fs.readFileSync(sourceFile);

if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

fs.writeFileSync(targetFile, source);
fs.writeFileSync(targetMinFile, UglifyJS.minify(targetFile).code);
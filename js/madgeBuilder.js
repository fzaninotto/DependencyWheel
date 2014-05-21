(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        var ret = factory();
        root.buildMatrixFromMadge = ret.buildMatrixFromMadge;
    }
}(this, function () {

    "use strict";

    var buildMatrixFromMadge = function(madgeTree) {

        var packageNames = [], matrix = [], i = 0, mapModIdx = {};

        //populate packagenames
        for(var module in madgeTree) {
            packageNames.push(module);
            mapModIdx[module] = i;
            i++;
        }

        for(var module in madgeTree) {
            var deps = madgeTree[module],
                matrixRow = Array.apply(null, new Array(packageNames.length)).map(Number.prototype.valueOf, 0);

            deps.forEach(function(mod) {
                matrixRow[mapModIdx[mod]] = 1;
            });

            matrix.push(matrixRow);
        }

        return {
            packageNames: packageNames,
            matrix: matrix
        }
    };

    return buildMatrixFromMadge;

}));
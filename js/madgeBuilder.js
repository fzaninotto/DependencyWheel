// given output from madge.tree of a particular set of modules
/*
 {"benchmarks/middleware":["http","index"],"examples/auth/app":["body-parser","cookie-parser","examples/auth/pass","express-session","index"]}
 */
// output the matrix
/*
 {
 packageNames: ['Main', 'A', 'B'],
 matrix: [[0, 1, 1], // Main depends on A and B
          [0, 0, 1], // A depends on B
          [0, 0, 0]] // B doesn't depend on A or Main
 };
 */

var buildMatrixFromMadge = function(madgeTree) {

    var packageNames = [], matrix = [], i= 0, mapModIdx = {};

    //populate packagenames
    for(var module in madgeTree) {
        packageNames.push(module);
        mapModIdx[module] = i;
        i++;
    }

    for(var module in madgeTree) {
        var deps = madgeTree[module],
            matrixRow = Array.apply(null, new Array(packageNames.length)).map(Number.prototype.valueOf,0);

        deps.forEach(function(mod) {
            matrixRow[mapModIdx[mod]] = 1;
        });

        matrix.push(matrixRow);
    }

    return {
        packageNames : packageNames,
        matrix : matrix
    }
}
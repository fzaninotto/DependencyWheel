(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        var ret = factory(root);
        root.buildMatrixFromComposerJson = ret.buildMatrixFromComposerJson;
        root.buildMatrixFromComposerJsonAndLock = ret.buildMatrixFromComposerJsonAndLock;
    }
}(this, function () {

    "use strict";

    var buildMatrixFromComposerJson = function(composerjson) {
        var n = Object.keys(composerjson.require).length;
        var matrix = [];
        matrix[0] = [0];
        var increment = 0;
        // only the first element depends on others
        for(var i = 1; i < n; i++) {
            matrix[0][i] = 1 + increment;
            increment += 0.001;
            matrix[i] = Array.apply(null, new Array(n)).map(Number.prototype.valueOf, 0);
            matrix[i][0] = 1;
        }
        var packageNames = Object.keys(composerjson.require);
        packageNames.unshift(composerjson.name);

        return {
            matrix: matrix,
            packageNames: packageNames
        }
    };

    var buildMatrixFromComposerJsonAndLock = function(composerjson, composerlock) {

        var packages = composerlock.packages;
        composerjson.isMain = true;
        packages.unshift(composerjson);

        var indexByName = {};
        var packageNames = {};
        var matrix = [];
        var n = 0;
        var replaces = {};

        // List the replacements
        packages.forEach(function(p) {
            if(!p.replace) return;
            for(var replaced in p.replace) {
                replaces[replaced] = p.name;
            }
        });

        // update required packages with replacements
        packages.forEach(function(p) {
            for(var packageName in p.require) {
                if(packageName in replaces) {
                    p.require[replaces[packageName]] = p.require[packageName];
                    delete p.require[packageName];
                }
            }
        });

        // Compute a unique index for each package name.
        packages.forEach(function(p) {
            var packageName = p.name;
            if(!(packageName in indexByName)) {
                packageNames[n] = packageName;
                indexByName[packageName] = n++;
            }
        });

        // Construct a square matrix counting package requires.
        packages.forEach(function(p) {
            var source = indexByName[p.name];
            var row = matrix[source];
            if(!row) {
                row = matrix[source] = [];
                for(var i = -1; ++i < n;) row[i] = 0;
            }
            for(var packageName in p.require) {
                row[indexByName[packageName]]++;
            }
        });

        // add small increment to equally weighted dependencies to force order
        matrix.forEach(function(row, index) {
            var increment = 0.001;
            for(var i = -1; ++i < n;) {
                var ii = (i + index) % n;
                if(row[ii] == 1) {
                    row[ii] += increment;
                    increment += 0.001;
                }
            }
        });

        return {
            matrix: matrix,
            packageNames: packageNames
        }
    };


    return {
        buildMatrixFromComposerJson: buildMatrixFromComposerJson,
        buildMatrixFromComposerJsonAndLock: buildMatrixFromComposerJsonAndLock
    }



}));
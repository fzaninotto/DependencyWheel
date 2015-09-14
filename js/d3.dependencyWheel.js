// Uses modified umd returnExports pattern:
// https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('d3'));
  } else {
    factory(root.d3);
  }
}(this, function (d3) {

  d3.chart = d3.chart || {};

  /**
   * Dependency wheel chart for d3.js
   *
   * Usage:
   * var chart = d3.chart.dependencyWheel();
   * d3.select('#chart_placeholder')
   *   .datum({
 *      packageNames: [the name of the packages in the matrix],
 *      matrix: [your dependency matrix]
 *   })
   *   .call(chart);
   *
   * // Data must be a matrix of dependencies. The first item must be the main package.
   * // For instance, if the main package depends on packages A and B, and package A
   * // also depends on package B, you should build the data as follows:
   *
   * var data = {
 *   packageNames: ['Main', 'A', 'B'],
 *   matrix: [[0, 1, 1], // Main depends on A and B
 *            [0, 0, 1], // A depends on B
 *            [0, 0, 0]] // B doesn't depend on A or Main
 * };
   *
   * // You can customize the chart width, margin (used to display package names),
   * // and padding (separating groups in the wheel)
   * var chart = d3.chart.dependencyWheel().width(700).margin(150).padding(.02);
   *
   * @author François Zaninotto
   * @license MIT
   * @see https://github.com/fzaninotto/DependencyWheel for complete source and license
   */
  d3.chart.dependencyWheel = function (options) {

    var width = 700;
    var height = 700;
    var margin = 150;
    var padding = 0.02;
    var colors = d3.scale.category20(),
        labelColor = '',
        labelSize = 11,
        outlineColor = 'grey',
        outlineThickness = 0.3;

    function chart(selection) {
      selection.each(function (data) {

        var matrix = data.matrix;
        var packageNames = data.packageNames;
        var radius = Math.min(width,height) / 2 - margin;

        // create the layout
        var chord = d3.layout.chord()
          .padding(padding)
          .sortSubgroups(d3.descending);

        // Select the svg element, if it exists.
        var svg = d3.select(this).selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        var gEnter = svg.enter().append("svg:svg")
          .attr("width", width)
          .attr("height", height)
          .attr("class", "dependencyWheel")
          .append("g")
          .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

        var arc = d3.svg.arc()
          .innerRadius(radius)
          .outerRadius(radius + 20);


        var fill = function (d) {
          if (d.index === 0) return '#ccc';
          return colors(parseInt(((packageNames[d.index][0].charCodeAt() - 97) / 26) * 360, 10));
        };

        // Returns an event handler for fading a given chord group.
        var fade = function (opacity) {
          return function (g, i) {
            svg.selectAll(".chord")
              .filter(function (d) {
                return d.source.index != i && d.target.index != i;
              })
              .transition()
              .style("opacity", opacity);
            var groups = [];
            svg.selectAll(".chord")
              .filter(function (d) {
                if (d.source.index == i) {
                  groups.push(d.target.index);
                }
                if (d.target.index == i) {
                  groups.push(d.source.index);
                }
              });
            groups.push(i);
            var length = groups.length;
            svg.selectAll('.group')
              .filter(function (d) {
                for (var i = 0; i < length; i++) {
                  if (groups[i] == d.index) return false;
                }
                return true;
              })
              .transition()
              .style("opacity", opacity);
          };
        };

        chord.matrix(matrix);

        var rootGroup = chord.groups()[0];
        var rotation = -(rootGroup.endAngle - rootGroup.startAngle) / 2 * (180 / Math.PI);

        var g = gEnter.selectAll("g.group")
          .data(chord.groups)
          .enter().append("svg:g")
          .attr("class", "group")
          .attr("transform", function (d) {
            return "rotate(" + rotation + ")";
          });

        g.append("svg:path")
          .style("fill", fill)
          .style("stroke", fill)
          .attr("d", arc)
          .on("mouseover", fade(0.1))
          .on("mouseout", fade(1));

        g.append("svg:text")
          .each(function (d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
          })
          .attr("dy", ".35em")
          .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : null;
          })
          .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
              "translate(" + (radius + 26) + ")" +
              (d.angle > Math.PI ? "rotate(180)" : "");
          })
          .text(function (d) {
            return packageNames[d.index];
          })
          .style('fill', labelColor)
          .style('font-size', labelSize+'px');

        gEnter.selectAll("path.chord")
          .data(chord.chords)
          .enter().append("svg:path")
          .attr("class", "chord")
          .style("stroke", function (d) {
            return d3.rgb(fill(d.source)).darker();
          })
          .style("fill", function (d) {
            return fill(d.source);
          })
          .attr("d", d3.svg.chord().radius(radius))
          .attr("transform", function (d) {
            return "rotate(" + rotation + ")";
          })
          .style("opacity", 1)
            .style('stroke', outlineColor)
            .style('stroke-width', outlineThickness);
      });
    }


    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------


    chart.colors = function (_) {
      if (_==undefined || !arguments.length) {
        colors = d3.scale.category20();
      }else{
          colors = d3.scale.category20().range(_);
      }
      return chart;
    };

    chart.width = function (value) {
      if (!arguments.length) return width;
      width = value;
      return chart;
    };

    chart.height = function (value) {
      if (!arguments.length) return height;
      height = value;
      return chart;
    };

    chart.margin = function (value) {
      if (!arguments.length) return margin;
      margin = value;
      return chart;
    };

    chart.padding = function (value) {
      if (!arguments.length) return padding;
      padding = value;
      return chart;
    };

    chart.outlineColor = function (_) {
       if (!arguments.length) return outlineColor;
       outlineColor = _;
       return chart;
    };

    chart.outlineThickness = function (_) {
       if (!arguments.length) return outlineThickness;
       outlineThickness = _;
       return chart;
    };

    chart.labelColor = function (_) {
       if (!arguments.length) return labelColor;
       labelColor = _;
       return chart;
    };

    chart.labelSize = function (_) {
       if (!arguments.length) return labelSize;
       labelSize = _;
        return chart;
    };


    //============================================================


    return chart;
  };

}));
function circularBar() {
  require.config({
    paths: {
      d3: "https://d3js.org/d3.v4.min",
    },
  });

  require(["d3"], function (d3) {
    function square(x) {
      return x * x;
    }

    function radial() {
      var linear = d3.scaleLinear();

      function scale(x) {
        return Math.sqrt(linear(x));
      }

      scale.domain = function (_) {
        return arguments.length ? (linear.domain(_), scale) : linear.domain();
      };

      scale.nice = function (count) {
        return linear.nice(count), scale;
      };

      scale.range = function (_) {
        return arguments.length
          ? (linear.range(_.map(square)), scale)
          : linear.range().map(Math.sqrt);
      };

      scale.ticks = linear.ticks;
      scale.tickFormat = linear.tickFormat;

      return scale;
    }
    d3.scaleRadial = radial;

    const tooltip = d3.select("#imports-exports").append("div")
    .attr('id', 'ie-tooltip')
    .style('position', 'absolute')
    .style("background-color", "black")
    .style('padding', 10)
    .style('display', 'none')

    function update(year) {
      d3.csv(
        getURL(`import_export/import_export.csv`),
        (data) => {
          let newObj = {
            country: data.Country,
            subject: data.Subject,
            value: +data.Value,
            year: +data.Time,
          };
          return newObj;
        },
        (error, data) => {
          data = data.filter((d) => d.year === year);
          let importData = data.filter((d) => d.subject === "IMP");
          let exportData = data.filter((d) => d.subject === "EXP");
          var margin = { top: 0, right: 0, bottom: 0, left: 0 },
            width = 1000 - margin.left - margin.right,
            height = 900 - margin.top - margin.bottom,
            innerRadius = 150,
            outerRadius = Math.min(width, height) / 2;

          var svg = d3
            .select("#imports-exports")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr(
              "transform",
              "translate(" +
                (width / 2 + margin.left) +
                "," +
                ((height / 2 + margin.top) - 100) +
                ")"
            );

          var x = d3
            .scaleBand()
            .range([0, 2 * Math.PI])
            .align(0)
            .domain(
              data.map(function (d) {
                return d.country;
              })
            );

          var y = d3
            .scaleRadial()
            .range([innerRadius, outerRadius])
            .domain([0, d3.max(data.map((d) => d.value))]);

          var ybis = d3
            .scaleRadial()
            .range([innerRadius, 5])
            .domain([0, d3.max(data.map((d) => d.value))]);

          svg
            .append("g")
            .selectAll("path")
            .data(exportData)
            .enter()
            .append("path")
            .attr("fill", "#69b3a2")
            .attr("class", "yo")
            .attr(
              "d",
              d3
                .arc()
                .innerRadius(innerRadius)
                .outerRadius(function (d) {
                  return y(d["value"]);
                })
                .startAngle(function (d) {
                  return x(d.country);
                })
                .endAngle(function (d) {
                  return x(d.country) + x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius)
            );

          svg
            .append("g")
            .selectAll("g")
            .data(exportData)
            .enter()
            .append("g")
            .attr("text-anchor", function (d) {
              return (x(d.country) + x.bandwidth() / 2 + Math.PI) %
                (2 * Math.PI) <
                Math.PI
                ? "end"
                : "start";
            })
            .attr("transform", function (d) {
              return (
                "rotate(" +
                (((x(d.country) + x.bandwidth() / 2) * 180) / Math.PI - 90) +
                ")" +
                "translate(" +
                (y(d["value"]) + 10) +
                ",0)"
              );
            })
            .append("text")
            .attr("class", "white-text")
            .text(function (d) {
              return d.country;
            })
            .attr("transform", function (d) {
              return (x(d.country) + x.bandwidth() / 2 + Math.PI) %
                (2 * Math.PI) <
                Math.PI
                ? "rotate(180)"
                : "rotate(0)";
            })
            .style("font-size", "11px")
            .style("color", "white")
            .attr("alignment-baseline", "middle")
            .on("mouseover", function (d) {
              // show tooltip
              d3.select("#ie-tooltip").style("display", "block")
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY + "px")
              .style("opacity", 1)
              .html(`<p>${d.country}-$ ${d.value}</p>`)
            })
            .on("mouseout", function (d) {
              // hide tooltip
              d3.select("#ie-tooltip").style("display", "none");
            });

          svg
            .append("g")
            .selectAll("path")
            .data(importData)
            .enter()
            .append("path")
            .attr("fill", "red")
            .attr(
              "d",
              d3
                .arc()
                .innerRadius(function (d) {
                  return ybis(0);
                })
                .outerRadius(function (d) {
                  return ybis(d["value"]);
                })
                .startAngle(function (d) {
                  return x(d.country);
                })
                .endAngle(function (d) {
                  return x(d.country) + x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius)
            );
        }
      );
    }

    // update chart when the slider changes based on value ranges
    const onChange = function (evt) {
      d3.select("#imports-exports").select("svg").remove();
      let val = evt.target.value;
      if (val >= 0 && val <= 33) {
        update(2019);
      } else if (val >= 34 && val <= 66) {
        update(2020);
      } else if (val >= 67 && val <= 100) {
        update(2021);
      }
    };

    let input = document.querySelector(".import-export-range");
    input.addEventListener("input", onChange, false);

    update(2019);
  });
}

circularBar();

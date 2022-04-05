function remittance() {
  require.config({
    paths: {
      d3: "https://d3js.org/d3.v4.min",
    },
  });

  require(["d3"], function (d3) {
    let margin = {
        top: 30,
        right: 0,
        bottom: 30,
        left: 50,
      },
      width = 250 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

    //Read the data
    d3.csv(
      "../../data/remittance/remittance-inflow.csv",
      function (data) {
        return {
          Year: data.Year,
          value: +data.value,
          Region: data.Region,
        };
      },
      function (data) {
        let sumstat = d3
          .nest()
          .key(function (d) {
            return d.Region;
          })
          .entries(data);

        console.log(sumstat);

        allKeys = sumstat.map(function (d) {
          return d.key;
        });

        console.log(allKeys);

        // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
        let svg = d3
          .select("#remittance-line")
          .selectAll("uniqueChart")
          .data(sumstat)
          .enter()
          .append("svg")
          .attr("class", (d, i) => {
            return "line-chart-svg-" + i;
          })
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        let x = d3
          .scaleBand()
          .range([0, width])
          .padding(0.4)
          .domain(
            data.map(function (d) {
              return d.Year;
            })
          );
        svg
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + (height - 20) + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .style("text-anchor", "end")
          .style("fill", "white")
          .style("font-weight", "lighter")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

        //Add Y axis
        let y = d3
          .scaleLinear()
          .domain([
            0,
            d3.max(data, function (d) {
              return +d.value;
            }),
          ])
          .range([height, 0]);
        svg.append("g")
        .attr("transform", "translate(0," + "-20" + ")")
        .attr("class", "y-axis").call(d3.axisLeft(y).ticks(5));

        // color palette

        let color = d3
          .scaleOrdinal()
          .domain(allKeys)
          .range([
            "#e41a1c",
            "#377eb8",
            "#4daf4a",
            "#984ea3",
            "#e41a1c",
            "#e41a1c",
            "#e41a1c",
          ]);

        // Draw the line
        svg
          .append("path")
          .attr("fill", "none")
          .attr("stroke", function (d) {
            // return color(d.key);
            return "white";
          })
          .attr("stroke-width", 1.9)
          .attr("d", function (d) {
            return d3
              .line()
              .x(function (d) {
                return x(d.Year);
              })
              .y(function (d) {
                return y(+d.value);
              })(d.values);
          });
        function xx(e) {
          return x(e.Year);
        }
        function yy(e) {
          return y(e.value);
        }

        // remove circles not on line
        for (let i = 0; i <= 5; i++) {
          console.log(".line-chart-svg-" + i);
          d3.select(".line-chart-svg-" + i)
            .selectAll("dot")
            .data(sumstat[i].values)
            .enter()
            .append("circle")
            .attr("fill", function (d) {
              return color(d.key);
            })
            .attr("r", function(d, i) {
              console.log(d)
              if (d.Year.includes("2020")) {
                return 10;
              } else {
                return 5;
              }
            })
            .attr("cx", (d, i) => {
              return xx(d) + margin.left;
            })
            .attr("cy", (d, i) => {
              return yy(d) + margin.top;
            })
            .on("mouseover", function (d) {
              // increase radius
              d3.select(this).attr("r", 10);
            })
            .on("mouseout", function (d) {
              console.log(d);
              // reset radius
              d3.select(this).attr("r", 5);
            });
        }

        // Add titles
        svg
          .append("text")
          .attr("text-anchor", "start")
          .attr("y", -10)
          .attr("x", 10)
          .text(function (d) {
            return d.key;
          })
          .style("fill", function (d) {
            return color(d.key);
          })
          .style("font-size", "11px")
          .style("fill", "white");

        svg.selectAll("g").style("stroke", "white");
        svg.selectAll("line").style("stroke", "white");
        svg.selectAll("path").style("stroke", "white");

      }
    );
  });
}

remittance();

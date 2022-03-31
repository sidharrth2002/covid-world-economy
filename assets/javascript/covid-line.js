// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  lineChartWidth = 900 - margin.left - margin.right,
  lineChartHeight = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#covid-line")
  .append("svg")
  .attr("width", lineChartWidth + margin.left + margin.right)
  .attr("height", lineChartHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data

let fetchLoc = "";
if (window.location.href.includes("covid-world")) {
  fetchLoc = `https://sidharrth.me/covid-world-economy/data/covid/covid_world.csv`;
} else {
  fetchLoc = `../../data/covid/covid_world.csv`;
}

d3.csv(fetchLoc)
  .then(function (d) {
    d.forEach(function (da) {
      da.date = new moment(da.date, "DD/MM/YYYY").format("YYYY-MM-DD");
      da.date = d3.timeParse("%Y-%m-%d")(da.date);
      da.new_cases = +da.new_cases;
    });
    return d;
  })
  .then(function (data) {
    // Add X axis --> it is a date format
    console.log(data);
    // var x = d3.scaleBand().range([0, lineChartWidth]).padding(0);

    // x.domain(
    //   d3.extent(data, function (d) {
    //     console.log(d.date)
    //     return d.date;
    //   })
    // );

    var x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
            console.log(d.date)
          return d.date;
        })
      )
      .range([0, lineChartWidth]);
    svg
      .append("g")
      .attr("transform", "translate(0," + (lineChartHeight - 10) + ")")
      .call(d3.axisBottom(x).ticks(50).tickFormat(d3.timeFormat("%y-%b-%d")))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-25)");
    // var xAxis_woy = d3.axisBottom(x).ticks(10000);
    //   .scale(x)
    //   .tickFormat(d3.timeFormat("%y-%b-%d"))
    //   .tickValues(data.map((d) => d.date));

    // svg
    //   .append("g")
    //   .attr("transform", "translate(0," + lineChartHeight + ")")
    //   .call(xAxis_woy);

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return +d.new_cases;
        }),
      ])
      .range([lineChartHeight, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function (d) {
      return d.date;
    }).left;

    // Create the circle that travels along the curve of chart
    var focus = svg
      .append("g")
      .append("circle")
      .style("fill", "none")
      .attr("stroke", "black")
      .attr("r", 8.5)
      .style("opacity", 0);

    // Create the text that travels along the curve of chart
    var focusText = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");

    // Add the line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.date);
          })
          .y(function (d) {
            return y(d.new_cases);
          })
      )

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg
      .append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", lineChartWidth)
      .attr("height", lineChartHeight)
      //   .on("mouseover", mouseover)
      //   .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
      focus.style("opacity", 1);
      focusText.style("opacity", 1);
    }

    function mousemove() {
      // recover coordinate we need
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisect(data, x0, 1);
      selectedData = data[i];
      focus
        .attr("cx", x(selectedData.date))
        .attr("cy", y(selectedData.new_cases));
      focusText
        .html(
          "x:" + selectedData.date + "  -  " + "y:" + selectedData.new_cases
        )
        .attr("x", x(selectedData.date) + 15)
        .attr("y", y(selectedData.new_cases));
    }
    function mouseout() {
      focus.style("opacity", 0);
      focusText.style("opacity", 0);
    }
  });

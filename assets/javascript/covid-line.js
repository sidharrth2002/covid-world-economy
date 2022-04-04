function covidLine(lineID) {
    require.config({
        paths: {
            d3: "https://d3js.org/d3.v6.min",
        },
    });

    require(["d3"], function (d3) {
                const lineMargin = {
                        top: 40,
                        right: 80,
                        bottom: 60,
                        left: 50
                    },
                    lineWidth = 1500 - lineMargin.left - lineMargin.right,
                    lineHeight = 500 - lineMargin.top - lineMargin.bottom;

                console.log(lineWidth);
                console.log(lineHeight);

                const parseDate = d3.timeParse("%d/%m/%Y"),
                    formatDate = d3.timeFormat("%b %d"),
                    formatMonth = d3.timeFormat("%b");

                const x = d3.scaleTime().range([0, lineWidth]);
                const y = d3.scaleLinear().range([lineHeight, 0]);

                const area = d3
                    .area()
                    .x((d) => {
                        return x(d.date);
                    })
                    .y0(lineHeight)
                    .y1((d) => {
                        return y(d.new_cases);
                    })
                    .curve(d3.curveCardinal);

                const valueline = d3
                    .line()
                    .x((d) => {
                        return x(d.date);
                    })
                    .y((d) => {
                        return y(d.new_cases);
                    })
                    .curve(d3.curveCardinal);

                const svg = d3
                    .select(lineID)
                    .append("svg")
                    .attr(
                        "viewBox",
                        `0 0 ${lineWidth + lineMargin.left + lineMargin.right} ${
    lineHeight + lineMargin.top + lineMargin.bottom}`)
                    .append("g")
                    .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

                svg
                    .append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + lineHeight + ")")
                    .call(d3.axisBottom(x).tickFormat(formatMonth));

                svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));

                svg
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - lineMargin.left)
                    .attr("x", 0 - lineHeight / 2)
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text("New Cases");

                svg
                    .append("a")
                    .attr("xlink:href", (d) => {
                        return "https://www.moex.com/ru/index/rtsusdcur.aspx?tid=2552";
                    })
                    .attr("class", "subtitle")
                    .attr("target", "_blank")
                    .append("text")
                    .attr("x", 0)
                    .attr("y", lineHeight + 50)
                    .text("Source: Our World in Data");


                appendData();

                function appendData() {
                    d3.selectAll("path.area").remove();
                    d3.selectAll("path.line").remove();
                    d3.selectAll(".title").remove();

                    filename = "../../data/covid/covid_world.csv";
                    d3.csv(filename).then((data) => {
                        data = data.reverse();
                        data.forEach((d) => {
                            d.date = parseDate(d.date);
                            d.new_cases = +d.new_cases;
                        });

                        console.log(data)

                        x.domain(
                            d3.extent(data, (d) => {
                                return d.date;
                            })
                        );
                        y.domain([
                            55,
                            d3.max(data, (d) => {
                                return d.new_cases;
                            }),
                        ]);

                        svg
                            .select(".x.axis")
                            .transition()
                            .duration(750)
                            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));
                        svg
                            .select(".y.axis")
                            .transition()
                            .duration(750)
                            .call(d3.axisLeft(y));

                        const areaPath = svg
                            .append("path")
                            .data([data])
                            .attr("class", "area")
                            .attr("d", area)
                            .attr("transform", "translate(0,300)")
                            .transition()
                            .duration(1000)
                            .attr("transform", "translate(0,0)");

                        const linePath = svg
                            .append("path")
                            .data([data])
                            .attr("class", "line")
                            .attr("d", valueline)
                        const pathLength = linePath.node().getTotalLength();
                        linePath
                            .attr("stroke-dasharray", pathLength)
                            .attr("stroke-dashoffset", pathLength)
                            .attr("stroke-width", 3)
                            .transition()
                            .duration(1000)
                            .attr("stroke-width", 0)
                            .attr("stroke-dashoffset", 0);

                        svg
                            .append("text")
                            .attr("class", "title")
                            .attr("x", lineWidth / 2)
                            .attr("y", 0 - lineMargin.top / 2)
                            .attr("text-anchor", "middle")
                            .text("Covid Cases");

                        const focus = svg
                            .append("g")
                            .attr("class", "focus")
                            .style("display", "none");

                        focus
                            .append("line")
                            .attr("class", "x")
                            .style("stroke-dasharray", "3,3")
                            .style("opacity", 0.5)
                            .attr("y1", 0)
                            .attr("y2", lineHeight);

                        focus
                            .append("line")
                            .attr("class", "y")
                            .style("stroke-dasharray", "3,3")
                            .style("opacity", 0.5)
                            .attr("x1", lineWidth)
                            .attr("x2", lineWidth);

                        focus
                            .append("circle")
                            .attr("class", "y")
                            .style("fill", "none")
                            .attr("r", 4);

                        focus.append("text").attr("class", "y1").attr("dx", 8).attr("dy", "-.3em");
                        focus.append("text").attr("class", "y2").attr("dx", 8).attr("dy", "-.3em");

                        focus.append("text").attr("class", "y3").attr("dx", 8).attr("dy", "1em");
                        focus.append("text").attr("class", "y4").attr("dx", 8).attr("dy", "1em");

                        function mouseMove(event) {
                            const bisect = d3.bisector((d) => d.date).left,
                                x0 = x.invert(d3.pointer(event, this)[0]),
                                i = bisect(data, x0, 1),
                                d0 = data[i - 1],
                                d1 = data[i],
                                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                            console.log(d)
                            // console.log("translate(" + x(d.date) + "," + y(d.new_cases) + ")");

                            focus
                                .select("circle.y")
                                .attr("transform", "translate(" + x(d.date) + "," + y(d.new_cases) + ")");

                            focus
                                .select("text.y1")
                                .attr("transform", "translate(" + x(d.date) + "," + y(d.new_cases) + ")")
                                .text(d.new_cases);

                            focus
                                .select("text.y2")
                                .attr("transform", "translate(" + x(d.date) + "," + y(d.new_cases) + ")")
                                .text(d.new_cases);

                            focus
                                .select("text.y3")
                                .attr("transform", "translate(" + x(d.date) + "," + y(d.new_cases) + ")")
                                .text(formatDate(d.date));

                            focus
                                .select("text.y4")
                                .attr("transform", "translate(" + x(d.date) + "," + y(d.new_cases) + ")")
                                .text(formatDate(d.date));

                            focus
                                .select(".x")
                                .attr("transform", "translate(" + x(d.date) + "," + y(d.new_cases) + ")")
                                .attr("y2", lineHeight - y(d.new_cases));

                            focus
                                .select(".y")
                                .attr("transform", "translate(" + lineWidth * -1 + "," + y(d.new_cases) + ")")
                                .attr("x2", lineWidth + lineWidth);
                        }

                        svg
                            .append("rect")
                            .attr("width", lineWidth)
                            .attr("height", lineHeight)
                            .style("fill", "none")
                            .style("pointer-events", "all")
                            .on("mouseover", () => {
                                focus.style("display", null);
                            })
                            .on("mouseout", () => {
                                focus.style("display", "none");
                            })
                            .on("touchmove mousemove", mouseMove);
                    });
                }
            })
        }

covidLine("#covid-line");
            // // set the dimensions and lineMargins of the graph
            // var lineMargin = { top: 10, right: 30, bottom: 30, left: 60 },
            //   lineChartWidth = 900 - lineMargin.left - lineMargin.right,
            //   lineChartHeight = 600 - lineMargin.top - lineMargin.bottom;

            // // append the svg object to the body of the page
            // var svg = d3
            //   .select("#covid-line")
            //   .append("svg")
            //   .attr("width", lineChartWidth + lineMargin.left + lineMargin.right)
            //   .attr("height", lineChartHeight + lineMargin.top + lineMargin.bottom)
            //   .append("g")
            //   .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

            // //Read the data

            // let fetchLoc = "";
            // if (window.location.href.includes("covid-world")) {
            //   fetchLoc = `https://sidharrth.me/covid-world-economy/data/covid/covid_world.csv`;
            // } else {
            //   fetchLoc = `../../data/covid/covid_world.csv`;
            // }

            // d3.csv(fetchLoc)
            //   .then(function (d) {
            //     d.forEach(function (da) {
            //       da.date = new moment(da.date, "DD/MM/YYYY").format("YYYY-MM-DD");
            //       da.date = d3.timeParse("%Y-%m-%d")(da.date);
            //       da.new_cases = +da.new_cases;
            //     });
            //     return d;
            //   })
            //   .then(function (data) {
            //     // Add X axis --> it is a date format
            //     console.log(data);
            //     // var x = d3.scaleBand().range([0, lineChartWidth]).padding(0);

            //     // x.domain(
            //     //   d3.extent(data, function (d) {
            //     //     console.log(d.date)
            //     //     return d.date;
            //     //   })
            //     // );

            //     var x = d3
            //       .scaleTime()
            //       .domain(
            //         d3.extent(data, function (d) {
            //             console.log(d.date)
            //           return d.date;
            //         })
            //       )
            //       .range([0, lineChartWidth]);
            //     svg
            //       .append("g")
            //       .attr("transform", "translate(0," + (lineChartHeight - 10) + ")")
            //       .call(d3.axisBottom(x).ticks(50).tickFormat(d3.timeFormat("%y-%b-%d")))
            //       .selectAll("text")
            //       .style("text-anchor", "end")
            //       .attr("dx", "-.8em")
            //       .attr("dy", ".15em")
            //       .attr("transform", "rotate(-25)");
            //     // var xAxis_woy = d3.axisBottom(x).ticks(10000);
            //     //   .scale(x)
            //     //   .tickFormat(d3.timeFormat("%y-%b-%d"))
            //     //   .tickValues(data.map((d) => d.date));

            //     // svg
            //     //   .append("g")
            //     //   .attr("transform", "translate(0," + lineChartHeight + ")")
            //     //   .call(xAxis_woy);

            //     // Add Y axis
            //     var y = d3
            //       .scaleLinear()
            //       .domain([
            //         0,
            //         d3.max(data, function (d) {
            //           return +d.new_cases;
            //         }),
            //       ])
            //       .range([lineChartHeight, 0]);
            //     svg.append("g").call(d3.axisLeft(y));

            //     // This allows to find the closest X index of the mouse:
            //     var bisect = d3.bisector(function (d) {
            //       return d.date;
            //     }).left;

            //     // Create the circle that travels along the curve of chart
            //     var focus = svg
            //       .append("g")
            //       .append("circle")
            //       .style("fill", "none")
            //       .attr("stroke", "black")
            //       .attr("r", 8.5)
            //       .style("opacity", 0);

            //     // Create the text that travels along the curve of chart
            //     var focusText = svg
            //       .append("g")
            //       .append("text")
            //       .style("opacity", 0)
            //       .attr("text-anchor", "left")
            //       .attr("alignment-baseline", "middle");

            //     // Add the line
            //     svg
            //       .append("path")
            //       .attr("class", "covid-line")
            //       .datum(data)
            //       .attr("fill", "none")
            //       .attr("stroke", "steelblue")
            //       .attr("stroke-width", 1.5)
            //       .attr(
            //         "d",
            //         d3
            //           .line()
            //           .x(function (d) {
            //             return x(d.date);
            //           })
            //           .y(function (d) {
            //             return y(d.new_cases);
            //           })
            //       )

            //     // Create a rect on top of the svg area: this rectangle recovers mouse position
            //     svg
            //       .append("rect")
            //       .style("fill", "none")
            //       .style("pointer-events", "all")
            //       .attr("width", lineChartWidth)
            //       .attr("height", lineChartHeight)
            //       //   .on("mouseover", mouseover)
            //       //   .on("mousemove", mousemove)
            //       .on("mouseout", mouseout);

            //     // What happens when the mouse move -> show the annotations at the right positions.
            //     function mouseover() {
            //       focus.style("opacity", 1);
            //       focusText.style("opacity", 1);
            //     }

            //     function mousemove() {
            //       // recover coordinate we need
            //       var x0 = x.invert(d3.mouse(this)[0]);
            //       var i = bisect(data, x0, 1);
            //       selectedData = data[i];
            //       focus
            //         .attr("cx", x(selectedData.date))
            //         .attr("cy", y(selectedData.new_cases));
            //       focusText
            //         .html(
            //           "x:" + selectedData.date + "  -  " + "y:" + selectedData.new_cases
            //         )
            //         .attr("x", x(selectedData.date) + 15)
            //         .attr("y", y(selectedData.new_cases));
            //     }
            //     function mouseout() {
            //       focus.style("opacity", 0);
            //       focusText.style("opacity", 0);
            //     }

            //     // animate line chart
            //     var totalLength = d3.select(".covid-line").node().getTotalLength();
            //     d3.select(".covid-line")
            //         .attr("stroke-dasharray", totalLength + " " + totalLength)
            //         .attr("stroke-dashoffset", totalLength)
            //         // .attr("stroke-width", 3)
            //         .transition()
            //         .duration(1000)
            //         // .attr("stroke-width", 0)
            //         // .attr("stroke-dashoffset", 0);
            //   });
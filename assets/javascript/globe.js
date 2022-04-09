function globe(globeID) {
  require.config({
    paths: {
      d3: "https://d3js.org/d3.v4.min",
    },
  });

  require(["d3"], function (d3) {
    // const parseDate = d3.timeParse("%d/%m/%Y");
    const parseDate = d3.timeParse("%d/%m/%Y");
    const formatDate = d3.timeFormat("%b %d");
    const formatFullDate = d3.timeFormat("%b-%m-%Y");
    const formatMonth = d3.timeFormat("%b");

    function drawLine(data) {
      console.log('Going to draw Covid Line')
      console.log(data);
      // Create SVG and padding for the chart
      const svg = d3
        .select("#country-line")
        .append("svg")
        .attr("class", "line-per-country")
        .attr("height", 300)
        .attr("width", 500);
      const margin = { top: 0, bottom: 10, left: 10, right: 10 };
      const chart = svg
        .append("g")
        .attr("transform", `translate(${margin.left + 30},-50)`);
      const width = +svg.attr("width") - margin.left - margin.right;
      console.log("Width is " + width);
      const height = +svg.attr("height") - margin.top - margin.bottom;
      const grp = chart
        .append("g")
        .attr("transform", `translate(-${margin.left},-${margin.top})`);

      // Add empty scales group for the scales to be attatched to on update
      chart.append("g").attr("class", "x-axis");
      chart.append("g").attr("class", "y-axis");

      // Add empty path
      const path = grp
        .append("path")
        .attr("class", "country-line-path")
        .attr("transform", `translate(${margin.left + 50},0)`)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5);

      function updateScales(data) {
        // Create scales
        const yScale = d3
          .scaleLinear()
          .range([height, 0])
          .domain([0, d3.max(data, (dataPoint) => dataPoint.new_cases)]);
        // const xScale = d3
        //   .scaleLinear()
        //   .range([0, width])
        //   .domain(d3.extent(data, (dataPoint) => dataPoint.year));
        console.log("Width is " + width);
        const xScale = d3
          .scaleTime()
          .range([0, width])
          .domain(d3.extent(data, (dataPoint) => dataPoint.date));

        return { yScale, xScale };
      }

      function createLine(xScale, yScale) {
        return (line = d3
          .line()
          .x((dataPoint) => xScale(dataPoint.date))
          .y((dataPoint) => yScale(dataPoint.new_cases)));
      }

      function updateAxes(data, chart, xScale, yScale) {
        chart
          .select(".x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(xScale).tickFormat(formatFullDate).ticks(50))
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");
        // .call(d3.axisBottom(x).tickFormat(formatDate));

        chart
          .select(".y-axis")
          .attr("transform", `translate(20, 0)`)
          .call(d3.axisLeft(yScale));
      }

      function updatePath(data, line) {
        const updatedPath = d3
          .select(".country-line-path")
          .interrupt()
          .datum(data)
          .attr("d", line);

        const pathLength = updatedPath.node().getTotalLength();
        // D3 provides lots of transition options, have a play around here:
        // https://github.com/d3/d3-transition
        const transitionPath = d3.transition().ease(d3.easeSin).duration(2500);
        updatedPath
          .attr("stroke-dashoffset", pathLength)
          .attr("stroke-dasharray", pathLength)
          .transition(transitionPath)
          .attr("stroke-dashoffset", 0);
      }

      function updateChart(data) {
        const { yScale, xScale } = updateScales(data);
        const line = createLine(xScale, yScale);
        updateAxes(data, chart, xScale, yScale);
        updatePath(data, line);
      }

      updateChart(data);
      // Update chart when button is clicked
      // d3.select("button").on("click", () => {
      //   // Create new fake data
      //   const newData = data.map((row) => {
      //     return { ...row, popularity: row.popularity * Math.random() };
      //   });
      //   updateChart(newData);
      // });
    }

    function drawGDPLine(country) {
      console.log('going to draw gdp line')
      // set the dimensions and margins of the graph
      var margin = { top: 10, right: 30, bottom: 30, left: 50 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3
        .select("#country-gdp-line")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //Read the data
      d3.csv(
        getURL("gdp/gdp.csv"),
        // When reading the csv, I must format variables:
        function (d) {
          return { date: d.date, value: d.value, country: d.country };
        },

        // Now I can use this dataset:
        function (data) {
          // Add X axis --> it is a date format
          data = data.filter(d => d.country === country)


          var x = d3
            .scaleBand()
            .padding(0.4)
            .domain(
              data.map(function (d) {
                return d.date;
              }
            ))
            .range([0, width]);
          svg
            .append("g")
            .attr("transform", "translate(0," + (height) + ")")
            .call(d3.axisBottom(x));

          // Add Y axis
          var y = d3
            .scaleLinear()
            .domain([
              0,
              d3.max(data, function (d) {
                return +d.value;
              }),
            ])
            .range([height, 0]);
          svg.append("g").call(d3.axisLeft(y));

          // Add the area
          svg
            .append("path")
            .datum(data)
            .attr("fill", "#cce5df")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr(
              "d",
              d3
                .area()
                .x(function (d) {
                  return x(d.date);
                })
                .y0(y(0))
                .y1(function (d) {
                  return y(d.value);
                })
            );
        }
      );
    }

    d3.csv(
      getURL(`covid/owid-covid-data.csv`),
      (data) => {
        data.location = data.location.replace(/\s/g, " ");
        data.date = parseDate(data.date);
        data.new_cases = +data.new_cases;
        let newData = {
          location: data.location,
          date: data.date,
          new_cases: data.new_cases,
        };
        return newData;
      },
      (error, rows) => {
        console.log(error);
        console.log("Printing all countries");
        // let locationList = rows.map(r => r.location);
        // locationList = locationList.filter((x, i, a) => a.indexOf(x) === i)
        let countrySelect = document.getElementById("country-list");

        // locationList.forEach(l => {
        //   let opt = document.createElement("option");
        //   opt.value = l.location;
        //   opt.text = l.location;
        //   countrySelect.add(opt, null);
        // })

        // ms to wait after dragging before auto-rotating
        var rotationDelay = 3000;
        // scale of the globe (not the canvas element)
        var scaleFactor = 0.9;
        // autorotation speed
        var degPerSec = 6;
        // start angles
        var angles = { x: -20, y: 40, z: 0 };
        // colors
        var colorWater = "#fff";
        var colorLand = "#111";
        var colorGraticule = "#ccc";
        var colorCountry = "#a00";

        //
        // Handler
        //

        function enter(country) {
          var country = countryList.find(function (c) {
            return parseInt(c.id, 10) === parseInt(country.id, 10);
          });
          if (country) {
            countryData = rows.filter((r) => r.location === country.name);
            d3.select("#country-line").selectAll("svg").remove();
            d3.select("#country-gdp-line").selectAll("svg").remove();
            d3.select("#country-line-title").text(`Daily Covid-19 cases in ${country.name}`);
            d3.select("#country-gdp-line-title").text(`GDP in ${country.name}`);
            drawLine(countryData);
            drawGDPLine(country.name);
          }
          current.text((country && country.name) || "");
        }

        function leave(country) {
          current.text("");
          d3.select("#country-line").select("svg").remove();
          d3.select("#country-gdp-line").selectAll("svg").remove();
          d3.select("#country-line-title").text("");
          d3.select("#country-gdp-line-title").text("");
        }

        //
        // Variables
        //

        var current = d3.select("#current");
        var canvas = d3.select(globeID);
        var context = canvas.node().getContext("2d");
        var water = { type: "Sphere" };
        var projection = d3.geoOrthographic().precision(0.1);
        var graticule = d3.geoGraticule10();
        var path = d3.geoPath(projection).context(context);
        var v0; // Mouse position in Cartesian coordinates at start of drag gesture.
        var r0; // Projection rotation as Euler angles at start.
        var q0; // Projection rotation as versor at start.
        var lastTime = d3.now();
        var degPerMs = degPerSec / 1000;
        var globeWidth, globeHeight;
        var land, countries;
        var countryList;
        var autorotate, now, diff, roation;
        var currentCountry;

        //
        // Functions
        //

        function setAngles() {
          var rotation = projection.rotate();
          rotation[0] = angles.y;
          rotation[1] = angles.x;
          rotation[2] = angles.z;
          projection.rotate(rotation);
        }

        function scale() {
          globeWidth = document.documentElement.clientWidth / 2 + 100;
          globeHeight = document.documentElement.clientHeight / 2 + 100;
          // globeWidth = 3000;
          // globeHeight = 3000;
          canvas.attr("width", globeWidth).attr("height", globeHeight);
          projection
            .scale((scaleFactor * Math.min(globeWidth, globeHeight)) / 2)
            .translate([globeWidth / 2, globeHeight / 2]);
          render();
        }

        function startRotation(delay) {
          autorotate.restart(rotate, delay || 0);
        }

        function stopRotation() {
          autorotate.stop();
        }

        function dragstarted() {
          v0 = versor.cartesian(projection.invert(d3.mouse(this)));
          r0 = projection.rotate();
          q0 = versor(r0);
          stopRotation();
        }

        function dragged() {
          var v1 = versor.cartesian(
            projection.rotate(r0).invert(d3.mouse(this))
          );
          var q1 = versor.multiply(q0, versor.delta(v0, v1));
          var r1 = versor.rotation(q1);
          projection.rotate(r1);
          render();
        }

        function dragended() {
          startRotation(rotationDelay);
        }

        function render() {
          context.clearRect(0, 0, globeWidth, globeHeight);
          fill(water, colorWater);
          stroke(graticule, colorGraticule);
          fill(land, colorLand);
          if (currentCountry) {
            fill(currentCountry, colorCountry);
          }
        }

        function fill(obj, color) {
          context.beginPath();
          path(obj);
          context.fillStyle = color;
          context.fill();
        }

        function stroke(obj, color) {
          context.beginPath();
          path(obj);
          context.strokeStyle = color;
          context.stroke();
        }

        function rotate(elapsed) {
          now = d3.now();
          diff = now - lastTime;
          if (diff < elapsed) {
            rotation = projection.rotate();
            rotation[0] += diff * degPerMs;
            projection.rotate(rotation);
            render();
          }
          lastTime = now;
        }

        function loadData(cb) {
          d3.json(
            "https://unpkg.com/world-atlas@1/world/110m.json",
            function (error, world) {
              if (error) throw error;
              d3.tsv(
                getURL(`globe/world.tsv`),
                // "https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/world-country-names.tsv",
                function (error, countries) {
                  if (error) throw error;
                  cb(world, countries);
                }
              );
            }
          );
        }

        // https://github.com/d3/d3-polygon
        function polygonContains(polygon, point) {
          var n = polygon.length;
          var p = polygon[n - 1];
          var x = point[0],
            y = point[1];
          var x0 = p[0],
            y0 = p[1];
          var x1, y1;
          var inside = false;
          for (var i = 0; i < n; ++i) {
            (p = polygon[i]), (x1 = p[0]), (y1 = p[1]);
            if (
              y1 > y !== y0 > y &&
              x < ((x0 - x1) * (y - y1)) / (y0 - y1) + x1
            )
              inside = !inside;
            (x0 = x1), (y0 = y1);
          }
          return inside;
        }

        function mousemove() {
          var c = getCountry(this);
          console.log(c);
          if (!c) {
            if (currentCountry) {
              leave(currentCountry);
              currentCountry = undefined;
              render();
            }
            return;
          }
          if (c === currentCountry) {
            return;
          }
          currentCountry = c;
          render();
          enter(c);
        }

        function getCountry(event) {
          var pos = projection.invert(d3.mouse(event));
          return countries.features.find(function (f) {
            return f.geometry.coordinates.find(function (c1) {
              return (
                polygonContains(c1, pos) ||
                c1.find(function (c2) {
                  return polygonContains(c2, pos);
                })
              );
            });
          });
        }

        //
        // Initialization
        //

        setAngles();

        canvas
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          )
          .on("mousemove", mousemove);

        loadData(function (world, cList) {
          land = topojson.feature(world, world.objects.land);
          countries = topojson.feature(world, world.objects.countries);
          countryList = cList;
          let onlyCountries = countryList.map((c) => c.name);
          console.log("Country List", onlyCountries);
          let countrySelect = document.getElementById("country-list");
          onlyCountries.sort().forEach((l) => {
            let opt = document.createElement("option");
            opt.value = l;
            opt.text = l;
            countrySelect.add(opt, null);
          });
          document
            .getElementById("country-list")
            .addEventListener("change", function () {
              let selectedCountry = this.value;
              let countryData = rows.filter(
                (r) => r.location === selectedCountry
              );
              d3.select("#country-line").selectAll("svg").remove();
              d3.select("#country-gdp-line").selectAll("svg").remove();
              d3.select("#country-line-title").text(`Daily Covid-19 cases in ${selectedCountry}`);
              d3.select("#country-gdp-line-title").text(`GDP in ${selectedCountry}`);
              drawLine(countryData);
              drawGDPLine(selectedCountry)
            });
          window.addEventListener("resize", scale);
          scale();
          autorotate = d3.timer(rotate);
        });
      }
    );
  });
}

globe("#globe");

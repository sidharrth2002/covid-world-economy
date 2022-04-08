function treemap() {
  require.config({
    paths: {
      d3v5: "https://d3js.org/d3.v5.min",
    },
  });

  require(["d3v5"], function (d3) {
    // Sidharrth Nagappan
    // 2022

    let width = (height = 100), // % of the parent element
      x = d3.scaleLinear().domain([0, width]).range([0, width]),
      y = d3.scaleLinear().domain([0, height]).range([0, height]),
      color = d3.scaleOrdinal().range(
        [
          "#060419",
          "#07051b",
          "#08051d",
          "#09061f",
          "#0a0722",
          "#0b0724",
          "#0c0826",
          "#0d0829",
          "#0e092b",
          "#10092d",
          "#110a30",
          "#120a32",
          "#140b34",
          "#150b37",
          "#160b39",
          "#180c3c",
          "#190c3e",
          "#1b0c41",
          "#1c0c43",
          "#1e0c45",
          "#1f0c48",
          "#210c4a",
          "#230c4c",
          "#240c4f",
          "#260c51",
          "#280b53",
          "#290b55",
          "#2b0b57",
          "#2d0b59",
          "#2f0a5b",
          "#310a5c",
          "#320a5e",
          "#340a5f",
          "#360961",
          "#380962",
          "#390963",
          "#3b0964",
          "#3d0965",
          "#3e0966",
          "#400a67",
          "#420a68",
          "#440a68",
          "#450a69",
          "#470b6a",
          "#490b6a",
          "#4a0c6b",
          "#4c0c6b",
          "#4d0d6c",
          "#4f0d6c",
          "#510e6c",
          "#520e6d",
          "#540f6d",
          "#550f6d",
          "#57106e",
          "#59106e",
          "#5a116e",
          "#5c126e",
          "#5d126e",
          "#5f136e",
          "#61136e",
          "#62146e",
          "#64156e",
          "#65156e",
          "#67166e",
          "#69166e",
          "#6a176e",
          "#6c186e",
          "#6d186e",
          "#6f196e",
          "#71196e",
          "#721a6e",
          "#741a6e",
          "#751b6e",
          "#771c6d",
          "#781c6d",
          "#7a1d6d",
          "#7c1d6d",
          "#7d1e6d",
          "#7f1e6c",
          "#801f6c",
          "#82206c",
          "#84206b",
          "#85216b",
          "#87216b",
          "#88226a",
          "#8a226a",
          "#8c2369",
          "#8d2369",
          "#8f2469",
          "#902568",
          "#922568",
          "#932667",
          "#952667",
          "#972766",
          "#982766",
          "#9a2865",
          "#9b2964",
          "#9d2964",
          "#9f2a63",
          "#a02a63",
          "#a22b62",
          "#a32c61",
          "#a52c60",
          "#a62d60",
          "#a82e5f",
          "#a92e5e",
          "#ab2f5e",
          "#ad305d",
          "#ae305c",
          "#b0315b",
          "#b1325a",
          "#b3325a",
          "#b43359",
          "#b63458",
          "#b73557",
          "#b93556",
          "#ba3655",
          "#bc3754",
          "#bd3853",
          "#bf3952",
          "#c03a51",
          "#c13a50",
          "#c33b4f",
          "#c43c4e",
          "#c63d4d",
          "#c73e4c",
          "#c83f4b",
          "#ca404a",
          "#cb4149",
          "#cc4248",
          "#ce4347",
          "#cf4446",
          "#d04545",
          "#d24644",
          "#d34743",
          "#d44842",
          "#d54a41",
          "#d74b3f",
          "#d84c3e",
          "#d94d3d",
          "#da4e3c",
          "#db503b",
          "#dd513a",
          "#de5238",
          "#df5337",
          "#e05536",
          "#e15635",
          "#e25734",
          "#e35933",
          "#e45a31",
          "#e55c30",
          "#e65d2f",
          "#e75e2e",
          "#e8602d",
          "#e9612b",
          "#ea632a",
          "#eb6429",
          "#eb6628",
          "#ec6726",
          "#ed6925",
          "#ee6a24",
          "#ef6c23",
          "#ef6e21",
          "#f06f20",
          "#f1711f",
          "#f1731d",
          "#f2741c",
          "#f3761b",
          "#f37819",
          "#f47918",
          "#f57b17",
          "#f57d15",
          "#f67e14",
          "#f68013",
          "#f78212",
          "#f78410",
          "#f8850f",
          "#f8870e",
          "#f8890c",
          "#f98b0b",
          "#f98c0a",
          "#f98e09",
          "#fa9008",
          "#fa9207",
          "#fa9407",
          "#fb9606",
          "#fb9706",
          "#fb9906",
          "#fb9b06",
          "#fb9d07",
          "#fc9f07",
          "#fca108",
          "#fca309",
          "#fca50a",
          "#fca60c",
          "#fca80d",
          "#fcaa0f",
          "#fcac11",
          "#fcae12",
          "#fcb014",
          "#fcb216",
          "#fcb418",
          "#fbb61a",
          "#fbb81d",
          "#fbba1f",
          "#fbbc21",
          "#fbbe23",
          "#fac026",
          "#fac228",
          "#fac42a",
          "#fac62d",
          "#f9c72f",
          "#f9c932",
          "#f9cb35",
          "#f8cd37",
          "#f8cf3a",
          "#f7d13d",
          "#f7d340",
          "#f6d543",
          "#f6d746",
          "#f5d949",
          "#f5db4c",
          "#f4dd4f",
          "#f4df53",
          "#f4e156",
          "#f3e35a",
          "#f3e55d",
          "#f2e661",
          "#f2e865",
          "#f2ea69",
          "#f1ec6d",
          "#f1ed71",
          "#f1ef75",
          "#f1f179",
          "#f2f27d",
          "#f2f482",
          "#f3f586",
          "#f3f68a",
          "#f4f88e",
          "#f5f992",
          "#f6fa96",
          "#f8fb9a",
          "#f9fc9d",
          "#fafda1",
          "#fcffa4",
        ]
        // [`#383867`, `#584c77`, `#33431e`, `#a36629`, `#92462f`, `#b63e36`, `#b74a70`, `#946943`]
        // d3.schemeDark2.map(function (c) {
        //   c = d3.rgb(c);
        //   c.opacity = 1.0;
        //   return '';
        // })
      );

    const update = (year) => {
      console.log(`../../data/debt/debt_${year}.json`);
      // let fetchLoc = "";
      // if (window.location.href.includes("covid-world")) {
      //   fetchLoc = `https://sidharrth.me/covid-world-economy/data/debt/debt_${year}.json`;
      // } else {
      //   fetchLoc = `../../data/debt/debt_${year}.json`;
      // }
      fetch(getURL(`debt/debt_${year}.json`))
        .then((d) => d.json())
        .then((data) => {
          data = data[0];
          console.log(data);
          let treemap = d3
            .treemap()
            .size([width, height])
            //.tile(d3.treemapResquarify) // doesn't work - height & width is 100%
            .paddingInner(0)
            .round(false); //true

          let nodes = d3
            .hierarchy(data)
            .sum(function (d) {
              return d.value ? 1 : 0;
            })
            .sort(function (a, b) {
              return b.height - a.height || b.value - a.value;
            });

          let currentDepth;

          treemap(nodes);

          let chart = d3.select("#chart");
          let cells = chart
            .selectAll(".node")
            .data(nodes.descendants())
            .enter()
            .append("div")
            .attr("class", function (d) {
              return "node level-" + d.depth;
            })
            .attr("title", function (d) {
              return d.data.name ? d.data.name : "null";
            });

          cells
            .style("left", function (d) {
              return x(d.x0) + "%";
            })
            .style("top", function (d) {
              return y(d.y0) + "%";
            })
            .style("width", function (d) {
              return x(d.x1) - x(d.x0) + "%";
            })
            .style("height", function (d) {
              return y(d.y1) - y(d.y0) + "%";
            })
            //.style("background-image", function(d) { return d.value ? imgUrl + d.value : ""; })
            //.style("background-image", function(d) { return d.value ? "url(http://placekitten.com/g/300/300)" : "none"; })
            .style("background-color", function (d) {
              while (d.depth > 2) d = d.parent;
              return color(d.data.name);
            })
            .on("click", zoom)
            .append("p")
            .attr("class", "label")
            .html(function (d) {
              let value;
              if (Object.hasOwn(d.data, "children")) {
                value = d.data.children.reduce(
                  (acc, cur) => acc + cur.value,
                  0
                );
              } else {
                value = d.data.value;
              }

              return d.data.name
                ? d.data.name +
                    " \n $" +
                    `<span>${numberWithCommas(value)}</span>`
                : "---";
            })
            .style("text-align", "center")
            .style("font-family", "Montserrat")
            .style("font-size", "18px")
            .data([data]);

          // runAnimations()
          //.style("opacity", function(d) { return isOverflowed( d.parent ) ? 1 : 0; });

          let parent = d3.select(".up").datum(nodes).on("click", zoom);

          function zoom(d) {
            // http://jsfiddle.net/ramnathv/amszcymq/

            console.log("clicked: " + d.data.name + ", depth: " + d.depth);

            if (d.depth === 2 && d3.select(".inner").empty()) {
              console.log("here");

              d3.selectAll(".label").style("display", "none");
              d3.selectAll(".node.level-2")
                .append("div")
                .attr("class", "inner")
                .append("p")
                .attr("class", "countUp")
                .html(function (d) {
                  // countUp.start()
                  return `${d.data.name} owes <b>$<span class="countup">${d.data.value}</span></b> to ${d.parent.data.name} in ${year}.`;
                });
              // countUp.start();

              runAnimations();
            } else if (d.depth < 2) {
              d3.selectAll(".inner").remove();
              d3.selectAll(".label").style("display", "block");
            }
            // enlarge size with zoom
            currentDepth = d.depth;
            parent.datum(d.parent || nodes);

            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);

            let t = d3.transition().duration(800).ease(d3.easeCubicOut);

            cells
              .transition(t)
              .style("left", function (d) {
                return x(d.x0) + "%";
              })
              .style("top", function (d) {
                return y(d.y0) + "%";
              })
              .style("width", function (d) {
                return x(d.x1) - x(d.x0) + "%";
              })
              .style("height", function (d) {
                return y(d.y1) - y(d.y0) + "%";
              });

            cells // hide this depth and above
              .filter(function (d) {
                return d.ancestors();
              })
              .classed("hide", function (d) {
                return d.children ? true : false;
              });

            cells // show this depth + 1 and below
              .filter(function (d) {
                return d.depth > currentDepth;
              })
              .classed("hide", false);
          }
        });
    };

    const onChange = function (evt) {
      d3.select("#chart").selectAll(".node").remove();
      let val = evt.target.value;
      if (val >= 0 && val <= 25) {
        update(2019);
      } else if (val >= 26 && val <= 50) {
        update(2020);
      } else if (val >= 51 && val <= 75) {
        update(2021);
      } else if (val >= 76 && val <= 100) {
        update(2022);
      }
    };

    var input = document.querySelector(".debt-range");
    input.addEventListener("input", onChange, false);

    update(2019);

    // How long you want the animation to take, in ms
    const animationDuration = 1000;
    // Calculate how long each ‘frame’ should last if we want to update the animation 60 times per second
    const frameDuration = 1000 / 60;
    // Use that to calculate how many frames we need to complete the animation
    const totalFrames = Math.round(animationDuration / frameDuration);
    // An ease-out function that slows the count as it progresses
    const easeOutQuad = (t) => t * (2 - t);

    // The animation function, which takes an Element
    const animateCountUp = (el) => {
      let frame = 0;
      const countTo = parseInt(el.innerHTML, 10);
      // Start the animation running 60 times per second
      const counter = setInterval(() => {
        frame++;
        // Calculate our progress as a value between 0 and 1
        // Pass that value to our easing function to get our
        // progress on a curve
        const progress = easeOutQuad(frame / totalFrames);
        // Use the progress value to calculate the current count
        const currentCount = Math.round(countTo * progress);

        // If the current count has changed, update the element
        if (parseInt(el.innerHTML, 10) !== currentCount) {
          el.innerHTML = currentCount;
        }

        // If we’ve reached our last frame, stop the animation
        if (frame === totalFrames) {
          clearInterval(counter);
        }
      }, frameDuration);
    };

    // Run the animation on all elements with a class of ‘countup’
    const runAnimations = () => {
      const countupEls = document.querySelectorAll(".countup");
      countupEls.forEach(animateCountUp);
    };

    function numberWithCommas(n) {
      return n.toString().replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
  });
}

treemap();

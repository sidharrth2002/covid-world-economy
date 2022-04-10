(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g = g.d3 || (g.d3 = {});
    g = g.layout || (g.layout = {});
    g.cloud = f();
  }
})(function () {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw ((f.code = "MODULE_NOT_FOUND"), f);
        }
        var l = (n[o] = { exports: {} });
        t[o][0].call(
          l.exports,
          function (e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          },
          l,
          l.exports,
          e,
          t,
          n,
          r
        );
      }
      return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  })(
    {
      1: [
        function (require, module, exports) {
          // Word cloud layout by Jason Davies, https://www.jasondavies.com/wordcloud/
          // Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf

          var dispatch = require("d3-dispatch").dispatch;

          var cloudRadians = Math.PI / 180,
            cw = (1 << 11) >> 5,
            ch = 1 << 11;

          module.exports = function () {
            var size = [256, 256],
              text = cloudText,
              font = cloudFont,
              fontSize = cloudFontSize,
              fontStyle = cloudFontNormal,
              fontWeight = cloudFontNormal,
              rotate = cloudRotate,
              padding = cloudPadding,
              spiral = archimedeanSpiral,
              words = [],
              timeInterval = Infinity,
              event = dispatch("word", "end"),
              timer = null,
              random = Math.random,
              cloud = {},
              canvas = cloudCanvas;

            cloud.canvas = function (_) {
              return arguments.length ? ((canvas = functor(_)), cloud) : canvas;
            };

            cloud.start = function () {
              var contextAndRatio = getContext(canvas()),
                board = zeroArray((size[0] >> 5) * size[1]),
                bounds = null,
                n = words.length,
                i = -1,
                tags = [],
                data = words
                  .map(function (d, i) {
                    d.text = text.call(this, d, i);
                    d.font = font.call(this, d, i);
                    d.style = fontStyle.call(this, d, i);
                    d.weight = fontWeight.call(this, d, i);
                    d.rotate = rotate.call(this, d, i);
                    d.size = ~~fontSize.call(this, d, i);
                    d.padding = padding.call(this, d, i);
                    return d;
                  })
                  .sort(function (a, b) {
                    return b.size - a.size;
                  });

              if (timer) clearInterval(timer);
              timer = setInterval(step, 0);
              step();

              return cloud;

              function step() {
                var start = Date.now();
                while (Date.now() - start < timeInterval && ++i < n && timer) {
                  var d = data[i];
                  d.x = (size[0] * (random() + 0.5)) >> 1;
                  d.y = (size[1] * (random() + 0.5)) >> 1;
                  cloudSprite(contextAndRatio, d, data, i);
                  if (d.hasText && place(board, d, bounds)) {
                    tags.push(d);
                    event.call("word", cloud, d);
                    if (bounds) cloudBounds(bounds, d);
                    else
                      bounds = [
                        { x: d.x + d.x0, y: d.y + d.y0 },
                        { x: d.x + d.x1, y: d.y + d.y1 },
                      ];
                    // Temporary hack
                    d.x -= size[0] >> 1;
                    d.y -= size[1] >> 1;
                  }
                }
                if (i >= n) {
                  cloud.stop();
                  event.call("end", cloud, tags, bounds);
                }
              }
            };

            cloud.stop = function () {
              if (timer) {
                clearInterval(timer);
                timer = null;
              }
              return cloud;
            };

            function getContext(canvas) {
              canvas.width = canvas.height = 1;
              var ratio = Math.sqrt(
                canvas.getContext("2d").getImageData(0, 0, 1, 1).data.length >>
                  2
              );
              canvas.width = (cw << 5) / ratio;
              canvas.height = ch / ratio;

              var context = canvas.getContext("2d");
              context.fillStyle = context.strokeStyle = "red";
              context.textAlign = "center";

              return { context: context, ratio: ratio };
            }

            function place(board, tag, bounds) {
              var perimeter = [
                  { x: 0, y: 0 },
                  { x: size[0], y: size[1] },
                ],
                startX = tag.x,
                startY = tag.y,
                maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
                s = spiral(size),
                dt = random() < 0.5 ? 1 : -1,
                t = -dt,
                dxdy,
                dx,
                dy;

              while ((dxdy = s((t += dt)))) {
                dx = ~~dxdy[0];
                dy = ~~dxdy[1];

                if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;

                tag.x = startX + dx;
                tag.y = startY + dy;

                if (
                  tag.x + tag.x0 < 0 ||
                  tag.y + tag.y0 < 0 ||
                  tag.x + tag.x1 > size[0] ||
                  tag.y + tag.y1 > size[1]
                )
                  continue;
                // TODO only check for collisions within current bounds.
                if (!bounds || !cloudCollide(tag, board, size[0])) {
                  if (!bounds || collideRects(tag, bounds)) {
                    var sprite = tag.sprite,
                      w = tag.width >> 5,
                      sw = size[0] >> 5,
                      lx = tag.x - (w << 4),
                      sx = lx & 0x7f,
                      msx = 32 - sx,
                      h = tag.y1 - tag.y0,
                      x = (tag.y + tag.y0) * sw + (lx >> 5),
                      last;
                    for (var j = 0; j < h; j++) {
                      last = 0;
                      for (var i = 0; i <= w; i++) {
                        board[x + i] |=
                          (last << msx) |
                          (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
                      }
                      x += sw;
                    }
                    delete tag.sprite;
                    return true;
                  }
                }
              }
              return false;
            }

            cloud.timeInterval = function (_) {
              return arguments.length
                ? ((timeInterval = _ == null ? Infinity : _), cloud)
                : timeInterval;
            };

            cloud.words = function (_) {
              return arguments.length ? ((words = _), cloud) : words;
            };

            cloud.size = function (_) {
              return arguments.length ? ((size = [+_[0], +_[1]]), cloud) : size;
            };

            cloud.font = function (_) {
              return arguments.length ? ((font = functor(_)), cloud) : font;
            };

            cloud.fontStyle = function (_) {
              return arguments.length
                ? ((fontStyle = functor(_)), cloud)
                : fontStyle;
            };

            cloud.fontWeight = function (_) {
              return arguments.length
                ? ((fontWeight = functor(_)), cloud)
                : fontWeight;
            };

            cloud.rotate = function (_) {
              return arguments.length ? ((rotate = functor(_)), cloud) : rotate;
            };

            cloud.text = function (_) {
              return arguments.length ? ((text = functor(_)), cloud) : text;
            };

            cloud.spiral = function (_) {
              return arguments.length
                ? ((spiral = spirals[_] || _), cloud)
                : spiral;
            };

            cloud.fontSize = function (_) {
              return arguments.length
                ? ((fontSize = functor(_)), cloud)
                : fontSize;
            };

            cloud.padding = function (_) {
              return arguments.length
                ? ((padding = functor(_)), cloud)
                : padding;
            };

            cloud.random = function (_) {
              return arguments.length ? ((random = _), cloud) : random;
            };

            cloud.on = function () {
              var value = event.on.apply(event, arguments);
              return value === event ? cloud : value;
            };

            return cloud;
          };

          function cloudText(d) {
            return d.text;
          }

          function cloudFont() {
            return "serif";
          }

          function cloudFontNormal() {
            return "normal";
          }

          function cloudFontSize(d) {
            return Math.sqrt(d.value);
          }

          function cloudRotate() {
            return (~~(Math.random() * 6) - 3) * 30;
          }

          function cloudPadding() {
            return 1;
          }

          // Fetches a monochrome sprite bitmap for the specified text.
          // Load in batches for speed.
          function cloudSprite(contextAndRatio, d, data, di) {
            if (d.sprite) return;
            var c = contextAndRatio.context,
              ratio = contextAndRatio.ratio;

            c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
            var x = 0,
              y = 0,
              maxh = 0,
              n = data.length;
            --di;
            while (++di < n) {
              d = data[di];
              c.save();
              c.font =
                d.style +
                " " +
                d.weight +
                " " +
                ~~((d.size + 1) / ratio) +
                "px " +
                d.font;
              var w = c.measureText(d.text + "m").width * ratio,
                h = d.size << 1;
              if (d.rotate) {
                var sr = Math.sin(d.rotate * cloudRadians),
                  cr = Math.cos(d.rotate * cloudRadians),
                  wcr = w * cr,
                  wsr = w * sr,
                  hcr = h * cr,
                  hsr = h * sr;
                w =
                  ((Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) +
                    0x1f) >>
                    5) <<
                  5;
                h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
              } else {
                w = ((w + 0x1f) >> 5) << 5;
              }
              if (h > maxh) maxh = h;
              if (x + w >= cw << 5) {
                x = 0;
                y += maxh;
                maxh = 0;
              }
              if (y + h >= ch) break;
              c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
              if (d.rotate) c.rotate(d.rotate * cloudRadians);
              c.fillText(d.text, 0, 0);
              if (d.padding)
                (c.lineWidth = 2 * d.padding), c.strokeText(d.text, 0, 0);
              c.restore();
              d.width = w;
              d.height = h;
              d.xoff = x;
              d.yoff = y;
              d.x1 = w >> 1;
              d.y1 = h >> 1;
              d.x0 = -d.x1;
              d.y0 = -d.y1;
              d.hasText = true;
              x += w;
            }
            var pixels = c.getImageData(
                0,
                0,
                (cw << 5) / ratio,
                ch / ratio
              ).data,
              sprite = [];
            while (--di >= 0) {
              d = data[di];
              if (!d.hasText) continue;
              var w = d.width,
                w32 = w >> 5,
                h = d.y1 - d.y0;
              // Zero the buffer
              for (var i = 0; i < h * w32; i++) sprite[i] = 0;
              x = d.xoff;
              if (x == null) return;
              y = d.yoff;
              var seen = 0,
                seenRow = -1;
              for (var j = 0; j < h; j++) {
                for (var i = 0; i < w; i++) {
                  var k = w32 * j + (i >> 5),
                    m = pixels[((y + j) * (cw << 5) + (x + i)) << 2]
                      ? 1 << (31 - (i % 32))
                      : 0;
                  sprite[k] |= m;
                  seen |= m;
                }
                if (seen) seenRow = j;
                else {
                  d.y0++;
                  h--;
                  j--;
                  y++;
                }
              }
              d.y1 = d.y0 + seenRow;
              d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
            }
          }

          // Use mask-based collision detection.
          function cloudCollide(tag, board, sw) {
            sw >>= 5;
            var sprite = tag.sprite,
              w = tag.width >> 5,
              lx = tag.x - (w << 4),
              sx = lx & 0x7f,
              msx = 32 - sx,
              h = tag.y1 - tag.y0,
              x = (tag.y + tag.y0) * sw + (lx >> 5),
              last;
            for (var j = 0; j < h; j++) {
              last = 0;
              for (var i = 0; i <= w; i++) {
                if (
                  ((last << msx) |
                    (i < w ? (last = sprite[j * w + i]) >>> sx : 0)) &
                  board[x + i]
                )
                  return true;
              }
              x += sw;
            }
            return false;
          }

          function cloudBounds(bounds, d) {
            var b0 = bounds[0],
              b1 = bounds[1];
            if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
            if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
            if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
            if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
          }

          function collideRects(a, b) {
            return (
              a.x + a.x1 > b[0].x &&
              a.x + a.x0 < b[1].x &&
              a.y + a.y1 > b[0].y &&
              a.y + a.y0 < b[1].y
            );
          }

          function archimedeanSpiral(size) {
            var e = size[0] / size[1];
            return function (t) {
              return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
            };
          }

          function rectangularSpiral(size) {
            var dy = 4,
              dx = (dy * size[0]) / size[1],
              x = 0,
              y = 0;
            return function (t) {
              var sign = t < 0 ? -1 : 1;
              // See triangular numbers: T_n = n * (n + 1) / 2.
              switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
                case 0:
                  x += dx;
                  break;
                case 1:
                  y += dy;
                  break;
                case 2:
                  x -= dx;
                  break;
                default:
                  y -= dy;
                  break;
              }
              return [x, y];
            };
          }

          // TODO reuse arrays?
          function zeroArray(n) {
            var a = [],
              i = -1;
            while (++i < n) a[i] = 0;
            return a;
          }

          function cloudCanvas() {
            return document.createElement("canvas");
          }

          function functor(d) {
            return typeof d === "function"
              ? d
              : function () {
                  return d;
                };
          }

          var spirals = {
            archimedean: archimedeanSpiral,
            rectangular: rectangularSpiral,
          };
        },
        { "d3-dispatch": 2 },
      ],
      2: [
        function (require, module, exports) {
          // https://d3js.org/d3-dispatch/ Version 1.0.3. Copyright 2017 Mike Bostock.
          (function (global, factory) {
            typeof exports === "object" && typeof module !== "undefined"
              ? factory(exports)
              : typeof define === "function" && define.amd
              ? define(["exports"], factory)
              : factory((global.d3 = global.d3 || {}));
          })(this, function (exports) {
            "use strict";

            var noop = { value: function () {} };

            function dispatch() {
              for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
                if (!(t = arguments[i] + "") || t in _)
                  throw new Error("illegal type: " + t);
                _[t] = [];
              }
              return new Dispatch(_);
            }

            function Dispatch(_) {
              this._ = _;
            }

            function parseTypenames(typenames, types) {
              return typenames
                .trim()
                .split(/^|\s+/)
                .map(function (t) {
                  var name = "",
                    i = t.indexOf(".");
                  if (i >= 0) (name = t.slice(i + 1)), (t = t.slice(0, i));
                  if (t && !types.hasOwnProperty(t))
                    throw new Error("unknown type: " + t);
                  return { type: t, name: name };
                });
            }

            Dispatch.prototype = dispatch.prototype = {
              constructor: Dispatch,
              on: function (typename, callback) {
                var _ = this._,
                  T = parseTypenames(typename + "", _),
                  t,
                  i = -1,
                  n = T.length;

                // If no callback was specified, return the callback of the given type and name.
                if (arguments.length < 2) {
                  while (++i < n)
                    if (
                      (t = (typename = T[i]).type) &&
                      (t = get(_[t], typename.name))
                    )
                      return t;
                  return;
                }

                // If a type was specified, set the callback for the given type and name.
                // Otherwise, if a null callback was specified, remove callbacks of the given name.
                if (callback != null && typeof callback !== "function")
                  throw new Error("invalid callback: " + callback);
                while (++i < n) {
                  if ((t = (typename = T[i]).type))
                    _[t] = set(_[t], typename.name, callback);
                  else if (callback == null)
                    for (t in _) _[t] = set(_[t], typename.name, null);
                }

                return this;
              },
              copy: function () {
                var copy = {},
                  _ = this._;
                for (var t in _) copy[t] = _[t].slice();
                return new Dispatch(copy);
              },
              call: function (type, that) {
                if ((n = arguments.length - 2) > 0)
                  for (var args = new Array(n), i = 0, n, t; i < n; ++i)
                    args[i] = arguments[i + 2];
                if (!this._.hasOwnProperty(type))
                  throw new Error("unknown type: " + type);
                for (t = this._[type], i = 0, n = t.length; i < n; ++i)
                  t[i].value.apply(that, args);
              },
              apply: function (type, that, args) {
                if (!this._.hasOwnProperty(type))
                  throw new Error("unknown type: " + type);
                for (var t = this._[type], i = 0, n = t.length; i < n; ++i)
                  t[i].value.apply(that, args);
              },
            };

            function get(type, name) {
              for (var i = 0, n = type.length, c; i < n; ++i) {
                if ((c = type[i]).name === name) {
                  return c.value;
                }
              }
            }

            function set(type, name, callback) {
              for (var i = 0, n = type.length; i < n; ++i) {
                if (type[i].name === name) {
                  (type[i] = noop),
                    (type = type.slice(0, i).concat(type.slice(i + 1)));
                  break;
                }
              }
              if (callback != null) type.push({ name: name, value: callback });
              return type;
            }

            exports.dispatch = dispatch;

            Object.defineProperty(exports, "__esModule", { value: true });
          });
        },
        {},
      ],
    },
    {},
    [1]
  )(1);
});

//Simple animated example of d3-cloud - https://github.com/jasondavies/d3-cloud
//Based on https://github.com/jasondavies/d3-cloud/blob/master/examples/simple.html

function updateWordCloud(term) {
  d3.select("#wordcloud").selectAll("*").remove();
  d3.csv(getURL(`tweets/${term}_tweets.csv`), function (data) {
    data = data.map((d) => d.tweet);
    drawWordCloud(data.join(" "));

    function drawWordCloud(text_string) {
      var common = "a,an,the,and,but,if,or,as";
      var total = 0;
      var word_count = {};
      var words = text_string.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
      console.log(words);
      if (words.length == 1) {
        word_count[words[0]] = 1;
      } else {
        words.forEach(function (word) {
          var word = word.toLowerCase();
          if (word != "" && common.indexOf(word) == -1 && word.length > 1) {
            if (word_count[word]) {
              word_count[word]++;
              total++;
            } else {
              word_count[word] = 1;
            }
          }
        });
      }
      var word_entries = Object.entries(word_count);

      var fill = d3.scaleOrdinal(d3.schemeCategory10);

      d3.layout
        .cloud()
        .size([1700, 600])
        .words(
          word_entries.map(function (d) {
            return { text: d[0], size: 40 + (d[1] / total) * 750 };
          })
        )
        .padding(2)
        .rotate(function () {
          if (Math.random() > 0.5) {
            return 90;
          } else {
            return ~~(Math.random() * 0) * 90;
          }
        })
        .font("Montserrat")
        .fontSize(function (d) {
          return d.size;
        })
        .on("end", draw)
        .start();

      function draw(words) {
        d3.select("#wordcloud")
          .append("svg")
          .attr("width", 1800)
          .attr("height", 700)
          .append("g")
          .attr("transform", "translate(400,300)")
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", function (d) {
            return d.size + "px";
          })
          .style("font-family", "EB Garamond")
          .style("fill", function (d, i) {
            return fill(i);
          })
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function (d) {
            return d.text;
          });
      }
    }
  });
}

updateWordCloud("covid");

document.querySelectorAll(".wordcloud-option").forEach((radio) => {
  radio.onclick = (e) => {
      updateWordCloud(e.target.value);
  };
})

// d3.csv("../../data/tweets/covid_tweets.csv", function (data) {
//   console.log(data);
//   tweets = data.map(d => d.tweet)
//   drawWordCloud(tweets.join(" "));
//   function drawWordCloud(text_string) {
//     // Identify more stop words from the article alice.txt
//     // var stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"];
//     // var stopwords = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];
//     var stopwords = ["0o", "0s", "3a", "3b", "3d", "6b", "6o", "a", "a1", "a2", "a3", "a4", "ab", "able", "about", "above", "abst", "ac", "accordance", "according", "accordingly", "across", "act", "actually", "ad", "added", "adj", "ae", "af", "affected", "affecting", "affects", "after", "afterwards", "ag", "again", "against", "ah", "ain", "ain't", "aj", "al", "all", "allow", "allows", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "announce", "another", "any", "anybody", "anyhow", "anymore", "anyone", "anything", "anyway", "anyways", "anywhere", "ao", "ap", "apart", "apparently", "appear", "appreciate", "appropriate", "approximately", "ar", "are", "aren", "arent", "aren't", "arise", "around", "as", "a's", "aside", "ask", "asking", "associated", "at", "au", "auth", "av", "available", "aw", "away", "awfully", "ax", "ay", "az", "b", "b1", "b2", "b3", "ba", "back", "bc", "bd", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "begin", "beginning", "beginnings", "begins", "behind", "being", "believe", "below", "beside", "besides", "best", "better", "between", "beyond", "bi", "bill", "biol", "bj", "bk", "bl", "bn", "both", "bottom", "bp", "br", "brief", "briefly", "bs", "bt", "bu", "but", "bx", "by", "c", "c1", "c2", "c3", "ca", "call", "came", "can", "cannot", "cant", "can't", "cause", "causes", "cc", "cd", "ce", "certain", "certainly", "cf", "cg", "ch", "changes", "ci", "cit", "cj", "cl", "clearly", "cm", "c'mon", "cn", "co", "com", "come", "comes", "con", "concerning", "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn", "couldnt", "couldn't", "course", "cp", "cq", "cr", "cry", "cs", "c's", "ct", "cu", "currently", "cv", "cx", "cy", "cz", "d", "d2", "da", "date", "dc", "dd", "de", "definitely", "describe", "described", "despite", "detail", "df", "di", "did", "didn", "didn't", "different", "dj", "dk", "dl", "do", "does", "doesn", "doesn't", "doing", "don", "done", "don't", "down", "downwards", "dp", "dr", "ds", "dt", "du", "due", "during", "dx", "dy", "e", "e2", "e3", "ea", "each", "ec", "ed", "edu", "ee", "ef", "effect", "eg", "ei", "eight", "eighty", "either", "ej", "el", "eleven", "else", "elsewhere", "em", "empty", "en", "end", "ending", "enough", "entirely", "eo", "ep", "eq", "er", "es", "especially", "est", "et", "et-al", "etc", "eu", "ev", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "ey", "f", "f2", "fa", "far", "fc", "few", "ff", "fi", "fifteen", "fifth", "fify", "fill", "find", "fire", "first", "five", "fix", "fj", "fl", "fn", "fo", "followed", "following", "follows", "for", "former", "formerly", "forth", "forty", "found", "four", "fr", "from", "front", "fs", "ft", "fu", "full", "further", "furthermore", "fy", "g", "ga", "gave", "ge", "get", "gets", "getting", "gi", "give", "given", "gives", "giving", "gj", "gl", "go", "goes", "going", "gone", "got", "gotten", "gr", "greetings", "gs", "gy", "h", "h2", "h3", "had", "hadn", "hadn't", "happens", "hardly", "has", "hasn", "hasnt", "hasn't", "have", "haven", "haven't", "having", "he", "hed", "he'd", "he'll", "hello", "help", "hence", "her", "here", "hereafter", "hereby", "herein", "heres", "here's", "hereupon", "hers", "herself", "hes", "he's", "hh", "hi", "hid", "him", "himself", "his", "hither", "hj", "ho", "home", "hopefully", "how", "howbeit", "however", "how's", "hr", "hs", "http", "hu", "hundred", "hy", "i", "i2", "i3", "i4", "i6", "i7", "i8", "ia", "ib", "ibid", "ic", "id", "i'd", "ie", "if", "ig", "ignored", "ih", "ii", "ij", "il", "i'll", "im", "i'm", "immediate", "immediately", "importance", "important", "in", "inasmuch", "inc", "indeed", "index", "indicate", "indicated", "indicates", "information", "inner", "insofar", "instead", "interest", "into", "invention", "inward", "io", "ip", "iq", "ir", "is", "isn", "isn't", "it", "itd", "it'd", "it'll", "its", "it's", "itself", "iv", "i've", "ix", "iy", "iz", "j", "jj", "jr", "js", "jt", "ju", "just", "k", "ke", "keep", "keeps", "kept", "kg", "kj", "km", "know", "known", "knows", "ko", "l", "l2", "la", "largely", "last", "lately", "later", "latter", "latterly", "lb", "lc", "le", "least", "les", "less", "lest", "let", "lets", "let's", "lf", "like", "liked", "likely", "line", "little", "lj", "ll", "ll", "ln", "lo", "look", "looking", "looks", "los", "lr", "ls", "lt", "ltd", "m", "m2", "ma", "made", "mainly", "make", "makes", "many", "may", "maybe", "me", "mean", "means", "meantime", "meanwhile", "merely", "mg", "might", "mightn", "mightn't", "mill", "million", "mine", "miss", "ml", "mn", "mo", "more", "moreover", "most", "mostly", "move", "mr", "mrs", "ms", "mt", "mu", "much", "mug", "must", "mustn", "mustn't", "my", "myself", "n", "n2", "na", "name", "namely", "nay", "nc", "nd", "ne", "near", "nearly", "necessarily", "necessary", "need", "needn", "needn't", "needs", "neither", "never", "nevertheless", "new", "next", "ng", "ni", "nine", "ninety", "nj", "nl", "nn", "no", "nobody", "non", "none", "nonetheless", "noone", "nor", "normally", "nos", "not", "noted", "nothing", "novel", "now", "nowhere", "nr", "ns", "nt", "ny", "o", "oa", "ob", "obtain", "obtained", "obviously", "oc", "od", "of", "off", "often", "og", "oh", "oi", "oj", "ok", "okay", "ol", "old", "om", "omitted", "on", "once", "one", "ones", "only", "onto", "oo", "op", "oq", "or", "ord", "os", "ot", "other", "others", "otherwise", "ou", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "ow", "owing", "own", "ox", "oz", "p", "p1", "p2", "p3", "page", "pagecount", "pages", "par", "part", "particular", "particularly", "pas", "past", "pc", "pd", "pe", "per", "perhaps", "pf", "ph", "pi", "pj", "pk", "pl", "placed", "please", "plus", "pm", "pn", "po", "poorly", "possible", "possibly", "potentially", "pp", "pq", "pr", "predominantly", "present", "presumably", "previously", "primarily", "probably", "promptly", "proud", "provides", "ps", "pt", "pu", "put", "py", "q", "qj", "qu", "que", "quickly", "quite", "qv", "r", "r2", "ra", "ran", "rather", "rc", "rd", "re", "readily", "really", "reasonably", "recent", "recently", "ref", "refs", "regarding", "regardless", "regards", "related", "relatively", "research", "research-articl", "respectively", "resulted", "resulting", "results", "rf", "rh", "ri", "right", "rj", "rl", "rm", "rn", "ro", "rq", "rr", "rs", "rt", "ru", "run", "rv", "ry", "s", "s2", "sa", "said", "same", "saw", "say", "saying", "says", "sc", "sd", "se", "sec", "second", "secondly", "section", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "sf", "shall", "shan", "shan't", "she", "shed", "she'd", "she'll", "shes", "she's", "should", "shouldn", "shouldn't", "should've", "show", "showed", "shown", "showns", "shows", "si", "side", "significant", "significantly", "similar", "similarly", "since", "sincere", "six", "sixty", "sj", "sl", "slightly", "sm", "sn", "so", "some", "somebody", "somehow", "someone", "somethan", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "sp", "specifically", "specified", "specify", "specifying", "sq", "sr", "ss", "st", "still", "stop", "strongly", "sub", "substantially", "successfully", "such", "sufficiently", "suggest", "sup", "sure", "sy", "system", "sz", "t", "t1", "t2", "t3", "take", "taken", "taking", "tb", "tc", "td", "te", "tell", "ten", "tends", "tf", "th", "than", "thank", "thanks", "thanx", "that", "that'll", "thats", "that's", "that've", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "thered", "therefore", "therein", "there'll", "thereof", "therere", "theres", "there's", "thereto", "thereupon", "there've", "these", "they", "theyd", "they'd", "they'll", "theyre", "they're", "they've", "thickv", "thin", "think", "third", "this", "thorough", "thoroughly", "those", "thou", "though", "thoughh", "thousand", "three", "throug", "through", "throughout", "thru", "thus", "ti", "til", "tip", "tj", "tl", "tm", "tn", "to", "together", "too", "took", "top", "toward", "towards", "tp", "tq", "tr", "tried", "tries", "truly", "try", "trying", "ts", "t's", "tt", "tv", "twelve", "twenty", "twice", "two", "tx", "u", "u201d", "ue", "ui", "uj", "uk", "um", "un", "under", "unfortunately", "unless", "unlike", "unlikely", "until", "unto", "uo", "up", "upon", "ups", "ur", "us", "use", "used", "useful", "usefully", "usefulness", "uses", "using", "usually", "ut", "v", "va", "value", "various", "vd", "ve", "ve", "very", "via", "viz", "vj", "vo", "vol", "vols", "volumtype", "vq", "vs", "vt", "vu", "w", "wa", "want", "wants", "was", "wasn", "wasnt", "wasn't", "way", "we", "wed", "we'd", "welcome", "well", "we'll", "well-b", "went", "were", "we're", "weren", "werent", "weren't", "we've", "what", "whatever", "what'll", "whats", "what's", "when", "whence", "whenever", "when's", "where", "whereafter", "whereas", "whereby", "wherein", "wheres", "where's", "whereupon", "wherever", "whether", "which", "while", "whim", "whither", "who", "whod", "whoever", "whole", "who'll", "whom", "whomever", "whos", "who's", "whose", "why", "why's", "wi", "widely", "will", "willing", "wish", "with", "within", "without", "wo", "won", "wonder", "wont", "won't", "words", "world", "would", "wouldn", "wouldnt", "wouldn't", "www", "x", "x1", "x2", "x3", "xf", "xi", "xj", "xk", "xl", "xn", "xo", "xs", "xt", "xv", "xx", "y", "y2", "yes", "yet", "yj", "yl", "you", "youd", "you'd", "you'll", "your", "youre", "you're", "yours", "yourself", "yourselves", "you've", "yr", "ys", "yt", "z", "zero", "zi", "zz"];
//     // var common = "a,an,the,and,but,if,or,as, ....";
//     var common = stopwords.join(",");
//     var word_count = {};
//     var words = text_string.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
//     if (words.length == 1) {
//       word_count[words[0]] = 1;
//     } else {
//       words.forEach(function (word) {
//         var word = word.toLowerCase();
//         if (word != "" && common.indexOf(word) == -1 && word.length > 1) {
//           if (word_count[word]) {
//             word_count[word]++;
//           } else {
//             word_count[word] = 1;
//           }
//         }
//       });
//       // words.forEach(function (word) {
//       //   word_count[word] = word_count[word] / words.length;
//       // });
//     }
//     var word_entries = Object.entries(word_count); // Provide the code to generate the word cloud
//     console.log(word_entries);
//     var fill = d3.scaleOrdinal(d3.schemeAccent);

//     d3.layout
//       .cloud()
//       .size([800, 800])
//       .words(
//         word_entries.map(function (d) {
//           return { text: d[0], size: 10 + Math.random() * 50 };
//         })
//       )
//       .padding(0)
//       .rotate(function () {
//         return ~~(Math.random() * 2) * 90;
//       })
//       .font("Impact")
//       .fontSize(function (d) {
//         return d.size;
//       })
//       .on("end", draw)
//       .start();

//     function draw(word_list) {
//       d3.select("#wordcloud")
//         .append("svg")
//         .attr("width", 800)
//         .attr("height", 800)
//         .append("g")
//         // .attr("transform", "translate(900,500)")
//         .selectAll("text")
//         .data(word_list)
//         .enter()
//         .append("text")
//         .style("font-size", function (d) {
//           return d.size + "px";
//         })
//         .style("font-family", "Impact")
//         .style("fill", function (d, i) {
//           return fill(i);
//         })
//         .attr("text-anchor", "middle")
//         .attr("transform", function (d) {
//           return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
//         })
//         .text(function (d) {
//           return d.text;
//         });
//     }
//   }
// });

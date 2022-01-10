
var width = 700,
  height = 1000,
  sens = 0.35,
  focused;

  //Setting projection

  var projection = d3.geo.orthographic()
  .scale(280)
  .rotate([0, 0])
  .translate([width / 2, height / 3])
  .clipAngle(90);

  var path = d3.geo.path()
  .projection(projection);

  //SVG container

  var svg2 = d3.select(".tyrone").append("svg")
  .attr("width", width)
  .attr("height", height);

  //Adding water

  svg2.append("path")
  .datum({type: "Sphere"})
  .attr("class", "water")
  .attr("d", path);

  var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
  countryList = d3.select(".tyrone")
                .append("select")
                .attr("name", "countries")
                .attr("id" , "tyrone-select")
                .on("change" , ()=>{
                  console.log(d3.select('#tyrone-select')._groups[0].option)
                })


  queue()
  .defer(d3.json, 'http://127.0.0.1:5500/programming-group/data/world-110m.json')
  .defer(d3.tsv, 'http://127.0.0.1:5500/programming-group/data/world-110m-country-names.tsv')
  .defer(d3.json, "https://coronavirus-tracker-api.herokuapp.com/confirmed")
  .defer(d3.tsv,"http://127.0.0.1:5500/programming-group/data/country-codes.tsv")
  .await(ready);

  //Main function

  function ready(error, world, countryData, apiData, countryCodes) {

    var countryById = {},
    countries = topojson.feature(world, world.objects.countries).features;
    //Adding countries to select

    countryData.forEach(function(d) {
      countryById[d.id] = d.name;
      option = countryList.append("option");
      option.text(d.name);
      option.property("value", d.id);
    });
    

    const cases = {}
    apiData.locations.forEach(d => {
        cases[d.country] = d.latest;
    })

    var countryById2 = {};
    countryCodes.forEach(d=>{
        apiData.locations.forEach(c=>{

            if(d["Alpha-2 code"] == c.country_code) //d["English short name"] == countryById[d.Numeric])
            {
            countryById2[d.Numeric] = c.country
        }
        })    
    })
    // console.log(cases);

    var getCases=(id)=>{
        return cases[countryById[id]] != null ? cases[countryById[id]] : cases[countryById2[id]];
    }

    //Drawing countries on the globe

    var world = svg2.selectAll("path.land")
    .data(countries)
    .enter().append("path")
    .attr("class", "land")
    .attr("d", path)

    //Drag event

    .call(d3.behavior.drag()
      .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
      .on("drag", function() {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
        svg2.selectAll("path.land").attr("d", path);
        svg2.selectAll(".focused").classed("focused", focused = false);
      }))

    //Mouse events

    .on("mouseover", function(d) {
      countryTooltip
      .html("Country: " + countryById[d.id] + "<br>Cases: " + getCases(d.id) ) 
      .style("left", (d3.event.pageX + 7) + "px")
      .style("top", (d3.event.pageY - 15) + "px")
      .style("display", "block")
      .style("opacity", 1);
    })
    .on("mouseout", function(d) {
      countryTooltip.style("opacity", 0)
      .style("display", "none");
    })
    .on("mousemove", function(d) {
      countryTooltip.style("left", (d3.event.pageX + 7) + "px")
      .style("top", (d3.event.pageY - 15) + "px");
    });

    //Country focus on option select

    d3.select("select").on("change", function() {
      var rotate = projection.rotate(),
      focusedCountry = country(countries, this),
      p = d3.geo.centroid(focusedCountry);

      svg2.selectAll(".focused").classed("focused", focused = false);

    //Globe rotating

    (function transition() {
      d3.transition()
      .duration(2500)
      .tween("rotate", function() {
        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
        return function(t) {
          projection.rotate(r(t));
          svg2.selectAll("path").attr("d", path)
          .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
        };
      })
      })();
    });

    function country(cnt, sel) { 
      for(var i = 0, l = cnt.length; i < l; i++) {
        if(cnt[i].id == sel.value) {return cnt[i];}
      }
    };

  };
//First DIV Auto scrolling list
ScrollRate = 60;

function ScrollDiv_init(){
    DivElement = document.getElementById("first-div-id");
    ReachedMaxScroll = false;

    DivElement.scrollTop=0;
    PreviousScrollTop = 0;

    ScrollInterval = setInterval('scrollDiv()', ScrollRate);

    // console.log(ScrollInterval)
}

function scrollDiv(){
    if(!ReachedMaxScroll){
        DivElement.scrollTop = PreviousScrollTop;
        PreviousScrollTop++;

        ReachedMaxScroll = DivElement.scrollTop >= (DivElement.scrollHeight - DivElement.offsetHeight);
    }
    else {
        ReachedMaxScroll = (DivElement.scrollTop == 0) ? false:true;

        DivElement.scrollTop = PreviousScrollTop;
        PreviousScrollTop--;
    }
}

function pauseDiv(){
    clearInterval(ScrollInterval);
}

function resumeDiv(){
    PreviousScrollTop = DivElement.scrollTop;
    ScrollInterval = setInterval('scrollDiv()', ScrollRate);
}


//dimensons of plot
var margin = {top:100, right:2, bottom:20, left:2},
        width = 560 - margin.left - margin.right,
        height = 680 - margin.top - margin.bottom,
        innerRadius = 100,
        outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object
var svg = d3.select("#fancyplot-id")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
   .append("g")
        .attr("class" , "muller-plot")
       .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

var countryTooltip = d3.select("body")
                        .append("div")
                        .attr("class", "countryTooltip");

d3.csv("data/worldometer_coronavirus_daily_data.csv", d3.autoType, function(data){

    //add list items into the auto scrolling list
    var cool_ul = document.getElementById("cool-list-id")
    var li_item = document.createElement("li");
    var para_element;
    var text_stuff;

    //list items data
    var li_data = [];
    for(let i=0; i<data.length-1; i++){
        if(data[i].country != data[i+1].country){
            li_data.push({
                date:data[i].date,
                country:data[i].country,
                cumulative_total_deaths:data[i].cumulative_total_deaths
            });
        }
    }

    for(let i = 0; i<li_data.length; i++){
        
        para = document.createElement("p");

        text_stuff ='' + li_data[i].date + '------------' + li_data[i].country + '---------------'+ li_data[i].cumulative_total_deaths;

        para_element = document.createTextNode(text_stuff);
        para.appendChild(para_element);

        cool_ul.appendChild(para);
    }

    setInterval(set_t, 5000);

    function set_t(){

        //shuffle dataset arr
        //Fisher-Yates algorithm
        for(let i = li_data.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * li_data.length);
            [li_data[i], li_data[j]] = [li_data[j], li_data[i]];
        }
        draw_barplot_graph(li_data);
    }

    function draw_barplot_graph(data){

        //clear screen
        d3.selectAll(".muller-plot >*").remove();

        // Scales
        var x = d3.scaleBand()
            .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
            .align(0)                  // This does nothing
            .domain(data.map(function(d) { return d.country; })); // The domain of the X axis is the list of states.
        var y = d3.scaleRadial()
            .range([innerRadius, outerRadius])   // Domain will be define later.
            .domain([0, 50000]); // Domain of Y is from 0 to the max seen in the data

        // Add the bars
        svg.append("g")
            .selectAll("muller-path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", function(d){
                //return '#' + Math.random().toString(16).substr(-6);
                return 'purple'
            })
            .on("mouseover", function(d){
                //var words = 
                countryTooltip
                .html('Country: '+d.country+'\n  Year: '+d.date+'\n  Cumulative Deaths: '+d.cumulative_total_deaths) 
                .style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("display", "block")
                .style("opacity", 1);
            })
            .on("mouseout", function(d) {
                countryTooltip.style("opacity", 0)
                                .style("display", "none");
            })
            .transition()
            .ease(d3.easeLinear)        
            .duration(1000)              
            .delay(100)
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                .innerRadius(innerRadius)
                .outerRadius(function(d) { return y(d.cumulative_total_deaths); })
                .startAngle(function(d) { return x(d.country); })
                .endAngle(function(d) { return x(d.country) + x.bandwidth(); })
                .padAngle(0.01)
                .padRadius(innerRadius));
                
        //add Labels
        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
                .attr("text-anchor", function(d) { return (x(d.country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
                .attr("transform", function(d) { return "rotate(" + ((x(d.country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.cumulative_total_deaths)+10) + ",0)"; })
            .append("text")
                .text(function(d){return(d.country)})
                .attr("transform", function(d) { return (x(d.country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
                .style("font-size", "11px")
                .attr("alignment-baseline", "middle")
                .style("opacity", 0.5)
                .style("cursor", "pointer")
            .transition()
            .ease(d3.easeLinear)
            .duration(1000)
            .delay(100)
    }

})
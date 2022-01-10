
                    // <script src="https://d3js.org/d3.v4.min.js"></script>
                    const width2 = 960,
                    height2 = 500;
                    const chartRadius = height2 / 2 - 40;

                    const color = d3.scale.ordinal(d3.schemeCategory10);

                    let tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip');

                    let svgr = d3.select('.radial-bar').append('svg')
                    .attr('width', width2)
                    .attr('height', height2)
                    .append('g')
                        .attr('transform', 'translate(' + width2 / 3 + ',' + height2 / 2 + ')')
                        .attr("class" , "main-canvas");

                    const PI = Math.PI,
                    arcMinRadius = 10,
                    arcPadding = 10,
                    labelPadding = -5,
                    numTicks = 15;

                    queue()
                    .defer(d3.json , "data/summary.json")
                    .await(ready);
                
                    function ready(error , summary)
                    {

                        var data = [];

                        // var myCountries = [];

                        var array = [];

                        summary.Countries.map((d)=>{

                            array.push(d.Country);

                        })

                        // var myParent = document.body;

                        var myParent = document.getElementById('radial');

                        //Create and append select list
                        var selectList = document.createElement("select");
                        selectList.id = "mySelect";
                        myParent.appendChild(selectList);
                        selectList.addEventListener("change" , ()=>{
                            update(selectList.value)
                        })

                        //Create and append the options
                        for (var i = 0; i < array.length; i++) {
                            var option = document.createElement("option");
                            option.value = array[i];
                            option.text = array[i];
                            selectList.appendChild(option);
                        }
                        

                        var countryName = document.getElementById("mySelect").value;


                        document.getElementById("country-text").innerHTML = countryName;

                        var new_data = summary.Countries.map((d)=>{

                            array.push(d.Country);

                            if(d.Country == countryName)
                            {
                                data = [{name: "TotalDeaths" , value: d.TotalDeaths } ,
                                 {name: "TotalConfirmed" , value: d.TotalConfirmed} , 
                                 {name: "TotalRecovered" , value: d.TotalRecovered} ,
                                 {name: "NewConfirmed" , value: d.NewConfirmed}
                                ]
                            }

                        })


                        let scale = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.value) * 1.1])
                        .range([0, 2 * PI]);

                        let ticks = scale.ticks(numTicks).slice(0, -1);
                        let keys = data.map((d, i) => d.name);
                        //number of arcs
                        const numArcs = keys.length;
                        // const numArcs = 3;
                        const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

                        let arc = d3.arc()
                        .innerRadius((d, i) => getInnerRadius(i))
                        .outerRadius((d, i) => getOuterRadius(i))
                        .startAngle(0)
                        .endAngle((d, i) => scale(d))

                        

                        let radialAxis = svgr.append('g')
                        .attr('class', 'r axis')
                        .selectAll('g')
                        .data(data)
                        .enter().append('g');

                        radialAxis.append('circle')
                        .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

                        radialAxis.append('text')
                        .attr('x', labelPadding)
                        .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
                        .text(d => d.name);

                    let axialAxis = svgr.append('g')
                        .attr('class', 'a axis')
                        .selectAll('g')
                        .data(ticks)
                        .enter().append('g')
                            .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

                    axialAxis.append('line')
                        .attr('x2', chartRadius);

                    axialAxis.append('text')
                        .attr('x', chartRadius + 10)
                        .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
                        .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
                        .text(d => d);

                    var newColors = ['red' , 'pink' , 'green' , 'blue']

                    //data arcs
                    let arcs = svgr.append('g')
                        .attr('class', 'data')
                        .selectAll('path')
                        .data(data)
                        .enter().append('path')
                        .attr('class', 'arc')
                        .style('fill', (d, i) => newColors[i])

                    arcs.transition()
                        .delay((d, i) => i * 200)
                        .duration(1000)
                        .attrTween('d', arcTween);

                    arcs.on('mousemove', showTooltip)
                    arcs.on('mouseout', hideTooltip)

                    var condArray = ['Total Deaths' , 'Total Confirmed' , 'Total Recovered' , 'New Confirmed'] 

                    var size = 20
                    svgr.selectAll("mydots")
                    .data(condArray)
                    .enter()
                    .append("rect")
                        .attr("x", 300)
                        .attr("y", function(d,i){ return -250 + i*(size+5)})                    
                        .attr("width", size)
                        .attr("height", size)
                        .style("fill", function(d , i){ return newColors[i]})
                    
                    svgr.selectAll("mylabels")
                    .data(condArray)
                    .enter()
                    .append("text")
                        .attr("x", 310 + size*1.2)
                        .attr("y", function(d,i){ return -250 + i*(size+5) + (size/2)}) 
                        .style("fill", "#000")
                        .text(function(d){ return d})
                        .attr("text-anchor", "left")
                        .style("alignment-baseline", "middle")


                    function arcTween(d, i) {
                        let interpolate = d3.interpolate(0, d.value);
                        return t => arc(interpolate(t), i);
                    }

                    function showTooltip(d) {
                        tooltip.style('left', (d3.event.pageX + 10) + 'px')
                        .style('top', (d3.event.pageY - 25) + 'px')
                        .style('display', 'inline-block')
                        .html(d.value);
                    }

                    function hideTooltip() {
                        tooltip.style('display', 'none');
                    }

                    function rad2deg(angle) {
                        return angle * 180 / PI;
                    }

                    function getInnerRadius(index) {
                        return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
                    }

                    function getOuterRadius(index) {
                        return getInnerRadius(index) + arcWidth;
                    }

                    // var update;

                        update = function(t)
                        {
                            console.log(t)

                            document.getElementById("country-text").innerHTML = t;

                            var new_data = summary.Countries.map((d)=>{

                                array.push(d.Country);

                                if(d.Country == t)
                                {
                                    data = [{name: "TotalDeaths" , value: d.TotalDeaths } ,
                                    {name: "TotalConfirmed" , value: d.TotalConfirmed} , 
                                    {name: "TotalRecovered" , value: d.TotalRecovered} ,
                                    {name: "NewConfirmed" , value: d.NewConfirmed}
                                    ]
                                }

                            })

                                var newColors = ['red' , 'pink' , 'green' , 'blue']

                                d3.selectAll(".main-canvas > *").remove()

                                let scale = d3.scaleLinear()
                                .domain([0, d3.max(data, d => d.value) * 1.1])
                                .range([0, 2 * PI]);

                                let ticks = scale.ticks(numTicks).slice(0, -1);
                                let keys = data.map((d, i) => d.name);
                                //number of arcs
                                const numArcs = keys.length;
                                // const numArcs = 3;
                                const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

                                let arc = d3.arc()
                                .innerRadius((d, i) => getInnerRadius(i))
                                .outerRadius((d, i) => getOuterRadius(i))
                                .startAngle(0)
                                .endAngle((d, i) => scale(d))

                                let radialAxis = svgr.append('g')
                                .attr('class', 'r axis')
                                .selectAll('g')
                                .data(data)
                                .enter().append('g');

                                radialAxis.append('circle')
                                .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

                                radialAxis.append('text')
                                .attr('x', labelPadding)
                                .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
                                .text(d => d.name);

                            let axialAxis = svgr.append('g')
                                .attr('class', 'a axis')
                                .selectAll('g')
                                .data(ticks)
                                .enter().append('g')
                                    .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

                            axialAxis.append('line')
                                .attr('x2', chartRadius);

                            axialAxis.append('text')
                                .attr('x', chartRadius + 10)
                                .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
                                .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
                                .text(d => d);

                            var condArray = ['Total Deaths' , 'Total Confirmed' , 'Total Recovered' , 'New Confirmed']

                            //data arcs
                            let arcs = svgr.append('g')
                                .attr('class', 'data')
                                .selectAll('path')
                                .data(data)
                                .enter().append('path')
                                .attr('class', 'arc')
                                .style('fill', (d, i) => newColors[i])

                            arcs.transition()
                                .delay((d, i) => i * 200)
                                .duration(1000)
                                .attrTween('d', arcTween);

                            arcs.on('mousemove', showTooltip)
                            arcs.on('mouseout', hideTooltip)

                            var size = 20
                            svgr.selectAll("mydots")
                            .data(condArray)
                            .enter()
                            .append("rect")
                                .attr("x", 300)
                                .attr("y", function(d,i){ return -250 + i*(size+5)})                    
                                .attr("width", size)
                                .attr("height", size)
                                .style("fill", function(d , i){ return newColors[i]})
                            
                            svgr.selectAll("mylabels")
                            .data(condArray)
                            .enter()
                            .append("text")
                                .attr("x", 310 + size*1.2)
                                .attr("y", function(d,i){ return -250 + i*(size+5) + (size/2)}) 
                                .style("fill", "#000")
                                .text(function(d){ return d})
                                .attr("text-anchor", "left")
                                .style("alignment-baseline", "middle")


                            function arcTween(d, i) {
                                let interpolate = d3.interpolate(0, d.value);
                                return t => arc(interpolate(t), i);
                            }

                            function showTooltip(d) {
                                tooltip.style('left', (d3.event.pageX + 10) + 'px')
                                .style('top', (d3.event.pageY - 25) + 'px')
                                .style('display', 'inline-block')
                                .html(d.value);
                            }

                            function hideTooltip() {
                                tooltip.style('display', 'none');
                            }

                            function rad2deg(angle) {
                                return angle * 180 / PI;
                            }

                            function getInnerRadius(index) {
                                return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
                            }

                            function getOuterRadius(index) {
                                return getInnerRadius(index) + arcWidth;
                            }


                        }


                    }

                    
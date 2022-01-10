const svg2 = d3.selectAll('.scatterPlot');
    const svg = d3.selectAll('.barChart');
    const margin = 75;
    const width = $('.d3-charts').width() - 2 * margin;
    const height = $('.d3-charts').height() - 2 * margin;
    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


    var scatterChart = svg2.append('g').attr('transform', `translate(${margin},45)`);
    var xScatterChart = d3.scaleLinear()
    .range([0, width]);

    var yScatterChart = d3.scaleLinear()
    .range([height, 0]);

    var xScatterAxis = d3.axisBottom(xScatterChart);
    var yScatterAxis = d3.axisLeft(yScatterChart);

    scatterChart.append("g")
        .attr("class", "y axis")
        .call(yScatterAxis)
    scatterChart.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xScatterAxis)


    svg2
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.4)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Life Expectancy')
    svg2.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.3)
        .attr('text-anchor', 'middle')
        .text('GDP per Capita')



    var barChart = svg.append('g')
    .attr('transform', `translate(${margin},45)`);
    var xChart = d3.scaleBand()
    .range([0, width])
    .padding(0.5);

    var yChart = d3.scaleLinear()
    .range([height, 0]);

    var xAxis = d3.axisBottom(xChart);
    var yAxis = d3.axisLeft(yChart);

    barChart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    barChart.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.4)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Population')
    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.3)
        .attr('text-anchor', 'middle')
        .text('Country')


    let csvArrayData = [];
    var slider = document.getElementById("slider");
    var output = document.getElementById("test");
    output.innerHTML = slider.value;


    slider.addEventListener('input', async function () {
        output.innerHTML = this.value;
        let fileNewArray = await modifyFileData(this.value);

        renderBargraph(fileNewArray.slice(0, 5));
        updateScattergraph(fileNewArray.slice(0, 50));

    })

    Promise.all([
        d3.csv("data/gapminder/population_total.csv"),
        d3.csv("data/gapminder/life_expectancy_years.csv"),
        d3.csv("data/gapminder/gdppercapita_us_inflation_adjusted.csv"),
    ]).then(async function (files) {
        csvArrayData = files;

        let dropArray = [];

        let headData = d3.keys(csvArrayData[2][0]);

        headData.map((head) => {
            if (head !== 'country') {
                if (!dropArray.includes(head)) {
                    dropArray.push(head);
                }
            }
        })

        dropArray = dropArray.sort((a, b) => a - b);
        slider.max = 2015;
        slider.min = 2005;
        slider.value = 2010;
        output.innerHTML = 2007;
        let fileNewArray = await modifyFileData(2010);
        renderBargraph(fileNewArray.slice(0, 5));
        renderScattergraph(fileNewArray.slice(0, 50));
    })


    modifyFileData = (startYear) => {
        if (csvArrayData.length !== 0 && csvArrayData.length === 3) {
            let newArray = [];
            csvArrayData.map((files, key) => {
                files.map((data, fileKey) => {
                    if (key === 0) {
                        newArray.push({ 'country': data.country, 'population': data[startYear] })
                    }
                    if (key === 1) {
                        newArray.push({ 'country': data.country, 'life_expectancy': data[startYear] })
                    }
                    if (key === 2) {
                        newArray.push({ 'country': data.country, 'gdp': data[startYear] })
                    }
                })
            })
            let fileNewArray = newArray.reduce((accumulator, currentValue) => {
                let isAvail = true;
                if (Array.isArray(accumulator) && accumulator.length === 0) {
                    accumulator.push(Object.assign({}, currentValue))
                }
                if (Array.isArray(accumulator) && accumulator.length !== 0) {
                    accumulator.map((acc, akey) => {
                        if (acc.country === currentValue.country) {
                            accumulator[akey] = Object.assign({}, acc, currentValue)
                        } else {
                            isAvail = false;
                        }
                    })
                }
                if (!isAvail) {
                    accumulator.push(Object.assign({}, currentValue))
                }
                return accumulator
            }, []).sort((a, b) => parseFloat(b.population) - parseFloat(a.population))
            return fileNewArray;
        }

    }



    renderBargraph = (data) => {
        try {

            xChart.domain(data.map(function (d) { return d.country; }));
            yChart.domain([0, d3.max(data, function (d) { return parseInt(d.population) }) * 1.07]);


            barChart.select('.y').call(yAxis.tickFormat(d3.format(".3s")));

            barChart.select('.xAxis')
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)

            var bars = barChart.selectAll(".bar")
            .data(data)
            bars.exit()
                .remove()
            bars.enter()
                .append("rect")

                .attr('class', function (d) {
                return "bar  " + d.country.split(' ').join('-');
            })
                .attr("x", function (d) { return xChart(d.country) })
                .attr("y", function (d) { return yChart(d.population); })
                .attr("height", function (d) { return height - yChart(d.population); })
                .attr("width", xChart.bandwidth())
                .attr('fill', '#4682b4')
                .on("mouseover", function (d) {
                d3.selectAll('.' + d.country.split(' ').join('-')).style("fill", "#71361c");
            }).on("mouseout", function (d) {
                d3.selectAll('.' + d.country.split(' ').join('-')).style("fill", "#4682b4");
                
            })

            bars.transition()
                .duration(100)
                .ease(d3.easeLinear)
                .attr('class', function (d) {
                return "bar  " + d.country.split(' ').join('-');
            })
                .attr('y', function (d) { return yChart(d.population); })
                .attr('height', function (d) { return height - yChart(d.population); })
                .style('fill', '#4682b4')
                .on("mouseover", function (d) {
                d3.selectAll('.' + d.country.split(' ').join('-')).style("fill", "#71361c");
            }).on("mouseout", function (d) {
                d3.selectAll('.' + d.country.split(' ').join('-')).style("fill", "#4682b4");
            })

        } catch (error) {
            console.log(error);
        }
    }


    updateScattergraph = (data) => {


        xScatterChart.domain([0, (d3.max(data, function (d) { return parseInt(d.gdp) }))])
        yScatterChart.domain([0, (d3.max(data, function (d) { return parseInt(d.life_expectancy) })) * 1.07]);

        scatterChart.select('.y').call(yScatterAxis);

        scatterChart.select('.xAxis')
            .attr("transform", "translate(0," + height + ")")
            .call(xScatterAxis)

        svg2.selectAll("circle")
            .data(data)
            .transition()
            .duration(500)
            .attr('class', function (d) {
            return d.country.split(' ').join('-');
        })
            .attr("cx", function (d) { return xScatterChart(parseFloat(d.gdp)); })
            .attr("cy", function (d) { return yScatterChart(parseFloat(d.life_expectancy)); })

    }

    renderScattergraph = (data) => {
        try {
            const chart = svg2.append('g')
            .attr('transform', `translate(${margin},45)`);


            xScatterChart.domain([0, (d3.max(data, function (d) { return parseInt(d['gdp']) }))])
            yScatterChart.domain([0, (d3.max(data, function (d) { return parseInt(d['life_expectancy']) })) * 1.07]);

            scatterChart.select('.y').call(yScatterAxis);

            scatterChart.select('.xAxis')
                .attr("transform", "translate(0," + height + ")")
                .call(xScatterAxis)


            chart.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr('class', function (d) {
                return "scatter " + d.country.split(' ').join('-');
            })
                .attr("cx", function (d) { return xScatterChart(parseFloat(d.gdp)); })
                .attr("cy", function (d) { return yScatterChart(parseFloat(d.life_expectancy)); })
                .attr("r", function (d) { return ((parseInt(d.population) * 0.00000007) / 5.5 > 5) ? (parseInt(d.population) * 0.00000007) / 5.5 : 5; })
                .style("fill", "#4682b4")
                .style("padding", "5")

                .on("click", function (d) {
                d3.selectAll('.scatter.' + d['country'].split(' ').join('-')).style("fill", "#b35227");
                d3.select(this).style("fill","#4682b4");
                selected = d.country.split(' ').join('-');
                d3.selectAll('.scatter').style("fill", "#4682b4");
            })
                .on("mouseover", function (d) {
                d3.selectAll('.' + d['country'].split(' ').join('-')).style("fill", "#71361c");
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.country)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
                .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
                if (selected === null) {
                    d3.selectAll('.' + d['country'].split(' ').join('-')).style("fill", "#4682b4");
                }
                if (selected !== null){
                    if(selected === d['country'].split(' ').join('-')){
                        d3.selectAll('.bar.' + d['country'].split(' ').join('-')).style("fill", "#4682b4");
                    }else{
                        d3.selectAll('.' + d['country'].split(' ').join('-')).style("fill", "#4682b4");
                    }

                    d3.selectAll('.scatter.' + selected).style("fill", "#b35227");
                }
            })




        } catch (error) {
            console.log(error);
        }
    }

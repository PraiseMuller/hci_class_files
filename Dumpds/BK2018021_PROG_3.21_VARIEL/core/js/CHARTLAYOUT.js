
         var svg = d3.select(".allChart"),
         margin = { top: 20, right: 20, bottom: 30, left: 68 },
         width = $('.d3-charts').width() - margin.left - margin.right,
         height = $('.d3-charts').height() - margin.top - margin.bottom,
         axis = svg.append("g").attr("transform", "translate(" + margin.left + ",25)");


     let ArrayData = [];

     Promise.all([
         d3.csv("data/sex_ratio_all_age_groups/population_aged_0_4_years_female_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_0_4_years_male_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_5_9_years_female_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_5_9_years_male_percent.csv"),

         d3.csv("data/sex_ratio_all_age_groups/population_aged_10_14_years_female_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_10_14_years_male_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_15_19_years_female_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_15_19_years_male_percent.csv"),

         d3.csv("data/sex_ratio_all_age_groups/population_aged_20_39_years_female_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_20_39_years_male_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_40_59_years_female_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_40_59_years_male_percent.csv"),

         d3.csv("data/sex_ratio_all_age_groups/population_aged_60plus_years_female_percent.csv"),
         d3.csv("data/sex_ratio_all_age_groups/population_aged_60plus_years_male_percent.csv"),


     ]).then(async function (files) {
         ArrayData = files;

         let yArray = [];
         let countryArray = [];
         let columnD = d3.keys(ArrayData[0][0]);
         columnD.map((year) => {
             if (year !== 'country') {
                 if (!yArray.includes(year) && year <= 2020) {
                     yArray.push(year);
                 }
             }
         })


         var TypeOfChart = 'grouped';
         var country = 'Canada';
         var year = '2005';

         var x = d3.scaleLinear()
         .rangeRound([0, width]);

         var y = d3.scaleBand()
         .rangeRound([height, 0])
         .paddingInner(0.15);

         var xScaleLeft = d3.scaleLinear()
         .range([width, 0]);

         var xScaleRight = d3.scaleLinear()
         .range([0, width]);

         var z = d3.scaleOrdinal()
         .range(["#F9BA00", "#04A1FF"]);


         ArrayData[0].map((contry) => {

             Object.keys(contry).map((Keys) => {
                 if (Keys === 'country') {



                     if (!countryArray.includes(contry[Keys])) {
                         countryArray.push(contry[Keys]);
                         if (contry[Keys] === country) {
                             $('#country').append(`<option selected value="${contry[Keys]}">
${contry[Keys]}
     </option>`);
                         } else {
                             $('#country').append(`<option  value="${contry[Keys]}">
${contry[Keys]}
     </option>`);
                         }

                     }
                 }
             })


         })


         let filter_data = [];
         filter_data = await changeData(country, year)

         let gList = ['Male', 'Female'];
         y.domain(filter_data.map(function (d) {
             return d['age'];
         }));

         z.domain(gList);


         axis
             .append("g")
             .attr("class", "xAxis")
             .attr("transform", "translate(0," + height + ")")
             .call(d3.axisBottom(x));

         axis
             .append("g")
             .attr("class", "y")
             .call(d3.axisLeft(y))

         let dataAge =[];
         dataAge = d3.nest()
             .key(d => { return d.age })
             .rollup(v => {
             let arr = [];
             v.map((data, key) => {
                 arr.push({ 'gender': 'female', 'male_percentage': data['male'], 'percentage': data['female'], 'age': data['age'], 'country': data['country'] });
                 arr.push({ 'gender': 'male', 'female_percentage': data['female'], 'percentage': data['male'], 'age': data['age'], 'country': data['country'] })
             })
             return arr;
         })
             .entries(filter_data)

         dataAge.forEach(y => {
             y.age = y.key;
             delete y.key;
         });




         var bars = axis
         .append("g")
         .selectAll("g")
         .data(dataAge)
         .enter().append("g")
         .attr("transform", d => { return "translate(0,0)"; });


         var rect = bars.selectAll("rect")
         .data(d => { return d.value; })
         .enter().append("rect")
         .attr("x", width)
         .attr("height", y.bandwidth());


         drawAll = (data) => {
             var legend = axis
             .append("g")
             .attr("font-family", "sans-serif")
             .attr("font-size", 10)
             .attr("text-anchor", "end")
             .selectAll("g")
             .data(data)
             .enter().append("g")
             .attr("transform", (d, i) => { return "translate(0," + i * 20 + ")"; });

             legend
                 .append("rect")
                 .attr("x", width - 19)
                 .attr("width", 19)
                 .attr("height", 19)
                 .attr("fill", z);

             legend
                 .append("text")
                 .attr("x", width - 24)
                 .attr("y", 9.5)
                 .attr("dy", "0.32em")
                 .text(d => { return d; });
         }



         showGrouped = () => {
             rect
                 .transition()
                 .duration(500)
                 .delay((d, i) => { return i * 10; })
                 .attr('class', d => { return d.gender })
                 .attr("x", d => { return 0 })
                 .attr("y", d => { return y(d.age) })
                 .attr("width", d => { return x(d['percentage']) })
                 .attr("height", y.bandwidth() / 2)
                 .attr("transform", d => { if (d.gender === 'male') { return `translate(0,${y.bandwidth() / 2})` } })
                 .attr("fill", d => {
                 if (d.gender === 'male') {
                     return '#F9BA00 ';
                 } else {
                     return '#04A1FF';
                 }
             });
         }

         showStacked = () => {
             rect
                 .transition()
                 .duration(500)
                 .delay((d, i) => { return i * 10; })
                 .attr('class', d => { return d.gender })
                 .attr("x", d => { return 0 })
                 .attr("y", d => { return y(d.age) })
                 .attr("width", d => {
                 return x(d['percentage'])
             })
                 .attr("height", y.bandwidth() / 1.1)
                 .attr("transform", d => {
                 if (d.gender === 'male') {
                     return `translate(${x(d['female_percentage'])},0)`
                 } else {
                     return `translate(0,0)`
                 }
             })
                 .attr("fill", d => {
                 if (d.gender === 'male') {
                     return '#F9BA00 ';
                 } else {
                     return '#04A1FF';
                 }
             });
         }


         showPyramid = () => {
             rect
                 .transition()
                 .duration(500)
                 .delay((d, i) => { return i * 10; })
                 .attr("x", d => { return 0 })
                 .attr("y", d => { return y(d.age) })
                 .attr("width", d => {
                 return (x(d['percentage']) - (width / 2))
             })
                 .attr("height", y.bandwidth())
                 .attr("transform", d => {
                 if (d.gender === 'male') {
                     return `translate(${(width / 2)},0)`
                 } else {
                     return `translate(${(width / 2) - (x(d['percentage']) - (width / 2))},0)`
                 }
             })
                 .attr("fill", d => {
                 if (d.gender === 'male') {
                     return '#F9BA00';
                 } else {
                     return '#04A1FF ';
                 }
             });

         }

         drawX = (type) => {
             axis
                 .select(".y")
                 .call(d3.axisLeft(y))
             if (type === 'grouped') {
                 x.domain([0, d3.max(filter_data, function (d) { return d.percentage })]).nice();
                 axis
                     .select(".xAxis")
                     .attr("transform", "translate(0," + height + ")")
                     .call(d3.axisBottom(x));
             }
             if (type === 'stacked') {
                 x.domain([0, d3.max(filter_data, function (d) { return d.percentage }) * 2.2]).nice();
                 axis
                     .select(".xAxis")
                     .attr("transform", "translate(0," + height + ")")
                     .call(d3.axisBottom(x));
             }

             if (type === 'pyramid') {
                 x.domain([-d3.max(filter_data, function (d) { return d.percentage }), d3.max(filter_data, function (d) { return d.percentage })]).nice();
                 axis
                     .select(".xAxis")
                     .attr("transform", "translate(0," + height + ")")
                     .call(d3.axisBottom(x).tickFormat(function (d) {
                     if (d < 0) d = -d;
                     return d;
                 }));
             }



         }

         drawX(TypeOfChart);
         showGrouped();

         drawAll(gList)

         $('#chart_type').on('change', function () {
             TypeOfChart = $(this).val();
             change();
         })

         $('#year').on('change', async function () {
             year = $(this).val();

             filter_data = await changeData(country, year);
             dataAge = [];
             dataAge = await d3.nest()
                 .key(d => { return d.age })
                 .rollup(v => {
                 let arr = [];
                 v.map((data, key) => {
                     arr.push({ 'gender': 'female',
                               'male_percentage': data['male'],
                               'percentage': data['female'], 'age': data['age'],
                               'country': data['country'] });
                     arr.push({ 'gender': 'male',
                               'female_percentage': data['female'],
                               'percentage': data['male'], 'age': data['age'],
                               'country': data['country'] })
                 })
                 return arr;
             })
                 .entries(filter_data)

             dataAge.forEach(y => {
                 y.age = y.key;
                 delete y.key;
             });
             change();
         })

         $('#country').on('change', async function () {
             country = $(this).val();
             filter_data = await changeData(country, year);
             dataAge = [];
             dataAge = await d3.nest()
                 .key(d => { return d.age })
                 .rollup(v => {
                 let arr = [];
                 v.map((data, key) => {
                     arr.push({ 'gender': 'female',
                               'male_percentage': data['male'],
                               'percentage': data['female'], 'age': data['age'],
                               'country': data['country'] });
                     arr.push({ 'gender': 'male',
                               'female_percentage': data['female'],
                               'percentage': data['male'], 'age': data['age'],
                               'country': data['country'] })
                 })
                 return arr;
             })
                 .entries(filter_data)

             dataAge.forEach(y => {
                 y.age = y.key;
                 delete y.key;
             });

             change();
         })

         function change() {
             console.log('triger');
             if (TypeOfChart === "grouped") {
                 drawX('grouped');
                 showGrouped();
             } else if (TypeOfChart === "stacked") {
                 drawX('stacked');
                 showStacked();
             } else {
                 drawX('pyramid');
                 showPyramid();
             }
         }

         svg
             .append('text')
             .attr('class', 'label')
             .attr('x', -(height / 2) - 10)
             .attr('y', margin.left / 3.4)
             .attr('transform', 'rotate(-90)')
             .attr('text-anchor', 'middle')
             .text('Age')
         svg
             .append('text')
             .attr('class', 'label')
             .attr('x', width / 1 + 40)
             .attr('y', height * 1 + 15)
             .attr('text-anchor', 'middle')
             .text('Population (%)')


         svg
             .append('text')
             .attr('class', 'chart-headding')
             .attr('x',  width / 2 + 80)
             .attr('y', 15)
             .attr('text-anchor', 'middle')
             .attr('font-size', 30)
             .text('Age Vs Population')

     })



     changeData = (county, startYear) => {

         if (ArrayData.length !== 0 && ArrayData.length === 14) {
             let newArray = [];
             ArrayData.map((files, key) => {
                 files.map((data, fileKey) => {
                     if (key === 0 && data.country === county) {
                         var str = "0-4";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'female': parseFloat(data[startYear]) })
                     }

                     if (key === 1 && data.country === county) {
                         var str = "0-4";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'male': parseFloat(data[startYear]) })
                     }

                     if (key === 2 && data.country === county) {
                         var str = "5-9";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'female': parseFloat(data[startYear]) })
                     }

                     if (key === 3 && data.country === county) {
                         var str = "5-9";
                         newArray.push({ 'country': data.country,
                                        'age': str, 'percentage': parseFloat(data[startYear]),
                                        'male': parseFloat(data[startYear]) })
                     }



                     if (key === 4 && data.country === county) {
                         var str = "10-14";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'female': parseFloat(data[startYear]) })
                     }

                     if (key === 5 && data.country === county) {
                         var str = "10-14";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'male': parseFloat(data[startYear]) })
                     }

                     if (key === 6 && data.country === county) {
                         var str = "15-19";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'female': parseFloat(data[startYear]) })
                     }

                     if (key === 7 && data.country === county) {
                         var str = "15-19";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'male': parseFloat(data[startYear]) })
                     }

                     if (key === 8 && data.country === county) {
                         var str = "20-39";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'female': parseFloat(data[startYear]) })
                     }

                     if (key === 9 && data.country === county) {
                         var str = "20-39";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'male': parseFloat(data[startYear]) })
                     }

                     if (key === 10 && data.country === county) {
                         var str = "40-59";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'female': parseFloat(data[startYear]) })
                     }

                     if (key === 11 && data.country === county) {
                         var str = "40-59";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'male': parseFloat(data[startYear]) })
                     }


                     if (key === 12 && data.country === county) {
                         var str = "60+";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'female': parseFloat(data[startYear]) })
                     }

                     if (key === 13 && data.country === county) {
                         var str = "60+";
                         newArray.push({ 'country': data.country,
                                        'age': str,
                                        'percentage': parseFloat(data[startYear]),
                                        'male': parseFloat(data[startYear]) })
                     }

                 })
             });



             let NewArray = newArray.reduce((accumulator, currentValue) => {
                 let Void = [];
                 if (Array.isArray(accumulator) && accumulator.length === 0) {
                     accumulator.push(Object.assign({}, currentValue))
                 }
                 if (Array.isArray(accumulator) && accumulator.length !== 0) {
                     accumulator.map((acc, akey) => {
                         if (acc['age'] === currentValue['age']) {
                             accumulator[akey] = Object.assign({}, acc, currentValue)
                             Void.push(true);
                         } else {
                             Void.push(false);
                         }
                     })
                 }

                 if (!Void.includes(true)) {
                     accumulator.push(Object.assign({}, currentValue))
                 }
                 return accumulator

             }, [])

             return NewArray;
         }

     }

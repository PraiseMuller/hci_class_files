// d3.csv("http://127.0.0.1:8080/population_total.csv", function(err, data) {
//     console.log(data);
// });
//python -m http.server 8080

 // var dataset = [34, 65, 78, 86, 24, 13, 36, 90, 65, 23, 70];
 // main_main();

var dataset = d3.csv('http://127.0.0.1:5500/population_total.csv',d3.autoType).then(function(d){
    dataset = d;
    dataset.forEach( function(d, i){
        d.order = i;
    });
   main_main();
});

var w = 800, h = 500, svg, bandScale;

svg = d3.select("#vis")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

//filtering data (qsn a)
function filteringData(){
    var population_filtered = [];
    //population less than 100000000
    dataset.filter(function(d){
        if(d['2000'] < 100000000){
            population_filtered.push(d['2000']);
        };
    });
    console.log("Filtered Country Population 100000000: \n" + population_filtered)
};

//sorting by year (y)
function sort_descending(some_dataset, y){

    var arr = some_dataset.map(function(d){
        return d[y];
    });

    var x = arr.sort((a,b) => {
        return d3.descending(parseInt(a), parseInt(b))
    });
    return x;
};

//Statistical calculation
function average_2000(){
    year_2000 = dataset.map(function(d){
        return d['2000'];
    });
    //average
    var sum = year_2000.reduce(function(a, b){
        return a + b;
    }, 0);
    mean = sum / year_2000.length;
    console.log('Average For Year 2000 = ' + mean)

    //countries with the largest and least populations in 2000
    var compare_arr = year_2000.sort((a,b) => {
        return d3.descending(parseInt(a), parseInt(b))
    });

    //10 countries with the biggest population
    ten_biggest = compare_arr.slice(0, 10);
    console.log('10 countries with the biggest population:\n' + ten_biggest);

    //10 countries with the least population
    var ten_least = [];
    for(var i = compare_arr.length-1; i > compare_arr.length-11; i--){
        ten_least.push(compare_arr[i]);
    }
    console.log('10 countries with the least population:\n' + ten_least);

    //calculating the standard deviation
    var sum_E = 0;

    year_2000.forEach(function(d, i){
        sum_E += (d - mean) * (d - mean);
    });

    var t = sum_E / year_2000.length;

    standard_deviation = Math.sqrt(t);

    console.log("Standard_deviation = " + standard_deviation);
};

//calculate total population of each country in 2000
function calculate_total_population_2000(){

    var arr = [];
    dataset.forEach(function(d){
        arr.push({
            c: d['country'],
            p: d['2000']
        });
    });

    arr.forEach(function(d, i){
        console.log('Country: ' + d.c + ' , ' + 'Population: ' + d.p);
    });
};


function main_main(){
   filteringData();
   x = sort_descending(dataset, 2000);
        console.log("Sorted in descending Order :\n");
        for(let i=0;i<10;i++){console.log(x[i])};
   average_2000();
   calculate_total_population_2000();
};

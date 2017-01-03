
$(function () {
    var x;
    var y;
    function chart2(chartIdentifier) {
        // var data = [[5, 3], [10, 17], [15, 4], [2, 8]];
        var margin = {top: 20, right: 15, bottom: 60, left: 60}
        , width = 400 - margin.left - margin.right
                , height = 500 - margin.top - margin.bottom;

        x = d3.scale.linear()
                .domain([0, 1])
                .range([0, width]);

        y = d3.scale.linear()
                .domain([0, 1])
                .range([height, 0]);

        var chart = d3.select('#' + chartIdentifier)
                .append('svg:svg')
                .attr('width', width + margin.right + margin.left)
                .attr('height', height + margin.top + margin.bottom)
                .attr('class', 'chart')

        var main = chart.append("g")
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'main')

        // draw the x axis
        var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

        main.append("g")
                .attr('transform', 'translate(0,' + height + ')')
                .attr('class', 'main axis date')
                .call(xAxis);

        // draw the y axis
        var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left');

        main.append("g")
                .attr('transform', 'translate(0,0)')
                .attr('class', 'main axis date')
                .call(yAxis);

        return main.append("svg:g");
    }
});

$(function () {

    function chart() {
        // var data = [[5, 3], [10, 17], [15, 4], [2, 8]];
        var margin = {top: 20, right: 15, bottom: 60, left: 60}
        , width = 960 - margin.left - margin.right
                , height = 500 - margin.top - margin.bottom;

        var x = d3.scale.linear()
                .domain([0, 2])
                .range([0, width]);

        var y = d3.scale.linear()
                .domain([0, 2])
                .range([height, 0]);

        var chart = d3.select('#chart')
                .append('svg:svg')
                .attr('width', width + margin.right + margin.left)
                .attr('height', height + margin.top + margin.bottom)
                .attr('class', 'chart')

        var main = chart.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'main')

        // draw the x axis
        var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

        main.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .attr('class', 'main axis date')
                .call(xAxis);

        // draw the y axis
        var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left');

        main.append('g')
                .attr('transform', 'translate(0,0)')
                .attr('class', 'main axis date')
                .call(yAxis);

        var g = main.append("svg:g");

        var socket = io.connect("http://localhost:3000");
        socket.on("train", function (data) {
            console.log(data.attr, data.value);
            var typeData = false;
            switch (data.attr) {
                case "blink":
                    element = $('#blink');
                    break;
                case "touching_forehead":
                    element = $('#touching_forehead');
                    break;
                case "good_signal":
                    element = $('#good_signal');
                    break;
                case "jaw_clench":
                    element = $('#jaw_clench');
                    break;
                case "data":
                    // console.log('data.value:', data.value);
                    typeData = true;
                    if (data.side == "right") {
                        $('#left').hide();
                        $('#right').show();
                         g.selectAll("scatter-dots")
                            .data(data.value)
                            .enter().append("svg:circle")
                            .attr("cx", function (d, i) {
                                return x(d[0]);
                            })
                            .attr("cy", function (d) {
                                return y(d[1]);
                            })
                            .style("fill", "red") 
                            .attr("r", 6);
                    } else {
                        $('#left').show();
                        $('#right').hide();
                         g.selectAll("scatter-dots")
                            .data(data.value)
                            .enter().append("svg:circle")
                            .attr("cx", function (d, i) {
                                return x(d[0]);
                            })
                            .attr("cy", function (d) {
                                return y(d[1]);
                            })
                            .style("fill", "blue") 
                            .attr("r", 6);
                    }
                    
                   
                default:
                    element = $('#blink');
                    break;
            }
            if (typeData == false) {
                if (data.value == 0) {
                    element.removeClass('btn-warning');
                    element.addClass('btn-success');
                } else {
                    element.removeClass('btn-success');
                    element.addClass('btn-warning');
                }
            }
        });
    }

    chart();

});

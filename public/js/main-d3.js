$(function () {
    var x;
    var y;
    function chart(chartIdentifier) {
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

    var train = chart('train');
    var test = chart('test');
    function connectToServer() {
        var socket = io.connect("http://localhost:3000");
        electrodeElements = [$('#is_good_TP9'), $('#is_good_AF7'),
            $('#is_good_AF8'), $('#is_good_TP10')];
        var color = "red";
        socket.on("train", function (data) {
            // console.log(data.attr, data.value);
            var typeData = false;
            switch (data.attr) {
                case "good_signal":
                    //due to the reason that we visualize all 4 electrodes it do not fit main mutton color change cheme
                    typeData = true;
                    for (var i = 0; i < 4; i++) {
                        if (data.value[i] == 1) {
                            electrodeElements[i].removeClass('btn-warning');
                            electrodeElements[i].addClass('btn-success');
                        } else {
                            electrodeElements[i].removeClass('btn-success');
                            electrodeElements[i].addClass('btn-warning');
                        }
                    }
                    break;
                case "blink":
                    element = $('#blink');
                    break;
                case "touching_forehead":
                    element = $('#touching_forehead');
                    break;
                case "jaw_clench":
                    element = $('#jaw_clench');
                    break;
                case "battery":
                    typeData = true;
                    $('#battery').text(data.value);
                    break;
                case "train":
                    // console.log('data.value:', data.value);
                    typeData = true;
                    if (data.side == "right") {
                        console.log("side:", data.side);
                        $('#left').hide();
                        $('#right').show();
                    } else {
                        $('#right').hide();
                        $('#left').show();
                        console.log("jau ");

                        color = "blue";
                    }

                    train.selectAll("scatter-dots")
                            .data(data.value)
                            .enter().append("svg:circle")
                            .attr("cx", function (d, i) {
                                return x(d[0]);
                            })
                            .attr("cy", function (d) {
                                return y(d[1]);
                            })
                            .style("fill", color)
                            .attr("r", 6);
                    break;
                case "test":
                    //console.log('data.value:', data.value);
                    typeData = true;
                    $('#left').hide();
                    if (data.side == "left") {
                        color = "blue";
                    }
                    test.selectAll("scatter-dots")
                            .data(data.value)
                            .enter().append("svg:circle")
                            .attr("cx", function (d, i) {
                                return x(d[0]);
                            })
                            .attr("cy", function (d) {
                                return y(d[1]);
                            })
                            .style("fill", color)
                            .attr("r", 6);
                    
                    break;
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

    connectToServer();
});

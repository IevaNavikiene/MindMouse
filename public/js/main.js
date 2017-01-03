$(document).ready(function () {
    var ctx;
    function drawCircle(x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

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

    /*
     * Must "chart" script be included before this object
     */
    mainController = function (config) {
        config = config || {};
        var props = ["trainElementName", "testElementName"];
        for (var i = 0; i < props.length; i++) {
            var key = props[i];
            if (config[key] !== undefined)
                this[key] = config[key];
        }
        this.connectToServer();
    };
    $.extend(mainController.prototype, {
        trainElementName: 'train',
        trainElement: {},
        testElementName: 'test',
        testElement: {},
        socket: {},
        electrodeElements: [$('#is_good_TP9'), $('#is_good_AF7'),
            $('#is_good_AF8'), $('#is_good_TP10')],
        connectToServer: function () {
            this.draw();
            this.trainElement = chart(this.trainElementName);
            this.testElement = chart(this.testElementName);
            this.socket = io.connect("http://localhost:3000");
            this.socket.on("train", function (data) {
                // console.log(data.attr, data.value);
                var typeData = false;
                var color = 'red';
                switch (data.attr) {
                    case "good_signal":
                        //due to the reason that we visualize all 4 electrodes it do not fit main mutton color change cheme
                        typeData = true;
                        for (var i = 0; i < 4; i++) {
                            if (data.value[i] == 1) {
                                this.electrodeElements[i].removeClass('btn-warning');
                                this.electrodeElements[i].addClass('btn-success');
                            } else {
                                this.electrodeElements[i].removeClass('btn-success');
                                this.electrodeElements[i].addClass('btn-warning');
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
                            color = "blue";
                        }

                        this.trainElement.selectAll("scatter-dots")
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
                        this.testElement.selectAll("scatter-dots")
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
        },
        changeMouseControll: function (action) {
            /*
             $("button").click(function (evt) {
             if (evt.ctrlKey){
             
             }
             });*/
            if (action.length == 0) {
                action = 'stop';
            }
            this.socket.emit("actions", action);
        },
        draw: function () {

            var WIDTH;
            var HEIGHT;
            var N = 10; //number of data points
            var data = new Array(N);
            var labels = new Array(N);
            var wb; // weights and offset structure
            var ss = 50.0; // scaling factor for drawing
            var svm = new svmjs.SVM();
            var trainstats;
            var kernelid = 1;
            var rbfKernelSigma = 0.5;
            var svmC = 1.0;
            canvas = document.getElementById('NPGcanvas');
            ctx = canvas.getContext('2d');



            data[0] = [-0.4326, 1.1909];
            data[1] = [3.0, 4.0];
            data[2] = [0.1253, -0.0376];
            data[3] = [0.2877, 0.3273];
            data[4] = [-1.1465, 0.1746];
            data[5] = [1.8133, 2.1139];
            data[6] = [2.7258, 3.0668];
            data[7] = [1.4117, 2.0593];
            data[8] = [4.1832, 1.9044];
            data[9] = [1.8636, 1.1677];
            labels[0] = 1;
            labels[1] = 1;
            labels[2] = 1;
            labels[3] = 1;
            labels[4] = 1;
            labels[5] = -1;
            labels[6] = -1;
            labels[7] = -1;
            labels[8] = -1;
            labels[9] = -1;






            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            // draw decisions in the grid
            var density = 4.0;
            for (var x = 0.0; x <= WIDTH; x += density) {
                for (var y = 0.0; y <= HEIGHT; y += density) {
                    var dec = svm.marginOne([(x - WIDTH / 2) / ss, (y - HEIGHT / 2) / ss]);
                    if (dec > 0)
                        ctx.fillStyle = 'rgb(150,250,150)';
                    else
                        ctx.fillStyle = 'rgb(250,150,150)';
                    ctx.fillRect(x - density / 2 - 1, y - density - 1, density + 2, density + 2);
                }
            }

            // draw axes
            ctx.beginPath();
            ctx.strokeStyle = 'rgb(50,50,50)';
            ctx.lineWidth = 1;
            ctx.moveTo(0, HEIGHT / 2);
            ctx.lineTo(WIDTH, HEIGHT / 2);
            ctx.moveTo(WIDTH / 2, 0);
            ctx.lineTo(WIDTH / 2, HEIGHT);
            ctx.stroke();

            // draw datapoints. Draw support vectors larger
            ctx.strokeStyle = 'rgb(0,0,0)';
            for (var i = 0; i < N; i++) {

                if (labels[i] == 1)
                    ctx.fillStyle = 'rgb(100,200,100)';
                else
                    ctx.fillStyle = 'rgb(200,100,100)';
                console.log(ctx, "ctx");
                if (svm.globalAlpha > 1e-2)
                    ctx.lineWidth = 3; // distinguish support vectors
                else
                    ctx.lineWidth = 1;

                drawCircle(data[i][0] * ss + WIDTH / 2, data[i][1] * ss + HEIGHT / 2, Math.floor(3 + svm.globalAlpha * 5.0 / svmC));
            }

            // if linear kernel, draw decision boundary and margin lines
            if (kernelid == 0) {

                var xs = [-5, 5];
                var ys = [0, 0];
                ys[0] = (-wb.b - wb.w[0] * xs[0]) / wb.w[1];
                ys[1] = (-wb.b - wb.w[0] * xs[1]) / wb.w[1];
                ctx.fillStyle = 'rgb(0,0,0)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                // wx+b=0 line
                ctx.moveTo(xs[0] * ss + WIDTH / 2, ys[0] * ss + HEIGHT / 2);
                ctx.lineTo(xs[1] * ss + WIDTH / 2, ys[1] * ss + HEIGHT / 2);
                // wx+b=1 line
                ctx.moveTo(xs[0] * ss + WIDTH / 2, (ys[0] - 1.0 / wb.w[1]) * ss + HEIGHT / 2);
                ctx.lineTo(xs[1] * ss + WIDTH / 2, (ys[1] - 1.0 / wb.w[1]) * ss + HEIGHT / 2);
                // wx+b=-1 line
                ctx.moveTo(xs[0] * ss + WIDTH / 2, (ys[0] + 1.0 / wb.w[1]) * ss + HEIGHT / 2);
                ctx.lineTo(xs[1] * ss + WIDTH / 2, (ys[1] + 1.0 / wb.w[1]) * ss + HEIGHT / 2);
                ctx.stroke();

                // draw margin lines for support vectors. The sum of the lengths of these
                // lines, scaled by C is essentially the total hinge loss.
                for (var i = 0; i < N; i++) {
                    if (svm.globalAlpha < 1e-2)
                        continue;
                    if (labels[i] == 1) {
                        ys[0] = (1 - wb.b - wb.w[0] * xs[0]) / wb.w[1];
                        ys[1] = (1 - wb.b - wb.w[0] * xs[1]) / wb.w[1];
                    } else {
                        ys[0] = (-1 - wb.b - wb.w[0] * xs[0]) / wb.w[1];
                        ys[1] = (-1 - wb.b - wb.w[0] * xs[1]) / wb.w[1];
                    }
                    var u = (data[i][0] - xs[0]) * (xs[1] - xs[0]) + (data[i][1] - ys[0]) * (ys[1] - ys[0]);
                    u = u / ((xs[0] - xs[1]) * (xs[0] - xs[1]) + (ys[0] - ys[1]) * (ys[0] - ys[1]));
                    var xi = xs[0] + u * (xs[1] - xs[0]);
                    var yi = ys[0] + u * (ys[1] - ys[0]);
                    ctx.moveTo(data[i][0] * ss + WIDTH / 2, data[i][1] * ss + HEIGHT / 2);
                    ctx.lineTo(xi * ss + WIDTH / 2, yi * ss + HEIGHT / 2);
                }
                ctx.stroke();
            }

            ctx.fillStyle = 'rgb(0,0,0)';
            //     ctx.fillText("Converged in " + trainstats.iters + " iterations.", 10, HEIGHT - 30);
            var numsupp = 0;
            for (var i = 0; i < N; i++) {
                if (svm.globalAlpha > 1e-5)
                    numsupp++;
            }
            ctx.fillText("Number of support vectors: " + numsupp + " / " + N, 10, HEIGHT - 50);

            if (kernelid === 1)
                ctx.fillText("Using Rbf kernel with sigma = " + rbfKernelSigma.toPrecision(2), 10, HEIGHT - 70);
            if (kernelid === 0)
                ctx.fillText("Using Linear kernel", 10, HEIGHT - 70);

            ctx.fillText("C = " + svmC.toPrecision(2), 10, HEIGHT - 90);
        }
    });
    var mainController = new mainController({
        train: 'train',
        test: 'test'
    });
});

$(document).ready(function () {
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
            this.trainElement = chart(this.trainElementName);
            this.testElement = chart(this.testElementName);
            this.socket = io.connect("http://localhost:3000");
            this.socket.on("train", $.proxy(function (data, fn) {
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
                        $('#battery').text('Battery remaining percent: ' + data.value);
                        break;
                    case "test":
                        typeData = true;
                        $('#left').hide();
                        $('#start_training').hide();
                        if (data.side == "left") {
                            color = "blue";
                        }
                        this.testElement.selectAll("scatter-dots")
                                .data([data.value])
                                .enter().append("svg:circle")
                                .attr("cx", function (d) {
                                    return x(d[0]);
                                })
                                .attr("cy", function (d) {
                                    return y(d[1]);
                                })
                                .style("fill", color)
                                .attr("r", 6);

                        break;
                    case "train":
                        // console.log('data.value:', data.value);
                        typeData = true;
                        if (data.side == "right") {
                            $('#left').hide();
                            $('#right').show();
                        } else {
                            $('#right').hide();
                            $('#left').show();
                            color = "blue";
                        }
                        this.trainElement.selectAll("scatter-dots")
                                .data([data.value])
                                .enter().append("svg:circle")
                                .attr("cx", function (d) {
                                    return x(d[0]);
                                })
                                .attr("cy", function (d) {
                                    return y(d[1]);
                                })
                                .style("fill", color)
                                .attr("r", 6);
                        break;
                    case "boundary":
                        typeData = true;
                        $('#left').hide();
                        var color;
                        $.each(data.value, $.proxy(function (index, point) {
                            color = 'red';

                            if (point[1] == 0) {
                                color = "blue";
                            }
                            this.trainElement.selectAll("scatter-dots")
                                    .data([point[0]])
                                    .enter().append("svg:circle")
                                    .attr("cx", function (d) {
                                        return x(d[0]);
                                    })
                                    .attr("cy", function (d) {
                                        return y(d[1]);
                                    })
                                    .style("stroke", "none")
                                    .style("fill", color)
                                    .style("opacity", 0.2)
                                    .attr("r", 6);
                            this.testElement.selectAll("scatter-dots")
                                    .data([point[0]])
                                    .enter().append("svg:circle")
                                    .attr("cx", function (d) {
                                        return x(d[0]);
                                    })
                                    .attr("cy", function (d) {
                                        return y(d[1]);
                                    })
                                    .style("stroke", "none")
                                    .style("fill", color)
                                    .style("opacity", 0.2)
                                    .attr("r", 6);
                        }, this));
                        $('#saveData').modal('show');
                        $('#cancel').on('click', $.proxy(function () {
                            this.changeMouseControll();
                        }, this));
                        $('#close-modal').on('click', $.proxy(function () {
                            this.changeMouseControll();
                        }, this));
                        $('#saveData').on('click', $.proxy(function () {
                            $('#saveData').modal('hide');
                            this.changeMouseControll();
                            this.saveTrainingData();
                        }, this));
                        break;
                    default:
					 console.log('aaaaaaa',data.attr, data.value);fn('woot');
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
            }, this));
            /*
             * Catch training start event
             */
            $('#start_training').on('click', $.proxy(function () {
                this.socket.emit("actions", 'startTraining');
				$('#start_training').hide();
            }, this));
			/* Start mouse control manually if something went wrong*/
			$('#mouse_control').on('click', $.proxy(function () {
                this.socket.emit("actions", 'start_stop');
            }, this));
			/* draw decision boundary manually if something went wrong*/
			$('#draw_boundary').on('click', $.proxy(function () {
                this.socket.emit("actions", 'boundary');
				//$('#draw_boundary').hide();
            }, this));
            /*
             * Catch stoping mouse movement event (with keybord press "y" letter
             *
             */
            $(document).keypress($.proxy(function (e) {
                var key = e.which;
                if (key == 121)  // y
                {
                    this.changeMouseControll();
                }
            }, this));
        },
        changeMouseControll: function () {
            this.socket.emit("actions", 'start_stop');
        },
        saveTrainingData() {
            this.socket.emit("actions", 'save_data');
        }
    });
    var mainController = new mainController({
        train: 'train',
        test: 'test'
    });
});

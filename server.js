var robot = require("robotjs");
function moveMouse(moveToSide, boundaryPx) {
    // Move the mouse across the screen as a sine wave.
    var screenSize = robot.getScreenSize();
    var width = screenSize.width;
    var mouse = robot.getMousePos();
    moveX = mouse.x + moveToSide;
    if (moveX > (width - boundaryPx)) {
        moveX = width - boundaryPx;
    } else if (moveX < boundaryPx) {
        moveX = boundaryPx;
    }
    robot.moveMouse(moveX, mouse.y);
}
var svm = require('node-svm');
// initialize a new predictor 
var clf = new svm.CSVC();
var SVMtrained = false;
var dataToTrainSVM = [];
var startedTraining = false;
var badSignal = false;
var blink = false;
var notTouchingForehead = false;
var jawClench = false;
var pause = 0;
var pauseTime = 20;
function trainSVM(data) {
    /*var data = [
     [[0, 0], 0],
     [[0, 1], 1],
     [[1, 0], 1],
     [[1, 1], 0]
     ];*/

    clf.train(data).done(function () {
        SVMtrained = true;
    });
}

function predictSVM(data) {
    //console.log(clf);
    var prediction = clf.predictSync(data);
    return prediction;
}
/*
var data = [
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 0], 0],
     [[0, 1], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 0], 1],
     [[1, 1], 0]
     ];
     trainSVM(data);
     predictSVM([0,1]);*/
var express = require('express');
var app = express();
var redis = require('redis')
var osc = require('osc')

var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser')

var lastPointTime = Date.now();
var now;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 5000
});

udpPort.open();

io.on('connection', function (socket) {
    console.log("socket.io connection");
    socket.emit('news', {hello: 'world'});
    // Listen for incoming OSC bundles.
    udpPort.on("message", function (oscData) {
        now = Date.now()
        if ((now - lastPointTime <= 2000) || (lastPointTime - now <= 2000)) {
            lastPointTime = now;
            if (oscData.address == "/muse/elements/beta_absolute") {
                if (oscData.args[1] != "0" && oscData.args[2] != "0" && badSignal == false) {
                    if (SVMtrained == false) {
                        if (dataToTrainSVM.length < 100) {
                            console.log('Think right');
                            dataToTrainSVM.push([[oscData.args[1], oscData.args[2]], 1]);
                            socket.emit('train', {"attr": "data", "side":"right", "value": [[oscData.args[1], oscData.args[2]], 1]});
                        } else if(pause < pauseTime){
                            //give user some time to concentrate on other side
                            pause += 1;
                        }else if (dataToTrainSVM.length < (200 + pauseTime)) {
                            console.log('Think left');
                            dataToTrainSVM.push([[oscData.args[1], oscData.args[2]], 0]);
                            socket.emit('train', {"attr": "data", "side":"left", "value": [[oscData.args[1], oscData.args[2]], 0]});
                        } else {
                            if (startedTraining == false) {
                                console.log('Training network...');
                                trainSVM(dataToTrainSVM);
                                startedTraining = true;
                            }
                        }

                    } else {
                        var answer = predictSVM([oscData.args[1], oscData.args[2]]);
                        if (answer > 0) {
                            moveMouse(50, 200);
                        } else {
                            moveMouse(-50, 200);
                        }
                        console.log('answer:', answer);
                    }
                }
                return;
            } else if (oscData.address == '/muse/elements/is_good') {
                tempBadSignal = badSignal;
                //vice versa because if argument is true the button will became orange
               // console.log(oscData.args[1],oscData.args[2],"oscData.args[1]");
                if (oscData.args[1] == "1" && oscData.args[2] == "1" && blink == false) {
                    badSignal = false;
                } else {
                    badSignal = true;
                }
                if (tempBadSignal != badSignal) {
                    socket.emit('train', {"attr": "good_signal", "value": badSignal});
                }
            } else if (oscData.address == '/muse/elements/blink') {
                tempBlink = blink;
                
                if (oscData.args == "1") {
                    blink = true;
                } else {
                    blink = false;
                }
                if (blink != tempBlink) {
                    socket.emit('train', {"attr": "blink", "value": blink});
                }
            } else if (oscData.address == '/muse/elements/jaw_clench') {
                tempJawClench = jawClench;
                if (oscData.args == "1") {
                    jawClench = true;
                } else {
                    jawClench = false;
                }
                if (jawClench != tempJawClench) {
                    socket.emit('train', {"attr": "jaw_clench", "value": jawClench});
                }
            } else if (oscData.address == '/muse/elements/touching_forehead') {
                tempNotTouchingForehead = notTouchingForehead;
                //vice versa because if argument is true the button will became orange
                if (oscData.args == "1") {
                    notTouchingForehead = false;
                } else {
                    notTouchingForehead = true;
                }
                if (notTouchingForehead != tempNotTouchingForehead) {
                    socket.emit('train', {"attr": "touching_forehead", "value": notTouchingForehead});
                }
            }//console.log(oscData.address);
        }
    });

});

var port = Number(process.env.PORT || 3000);
server.listen(port, function () {
    console.log("Listening on " + port);
});


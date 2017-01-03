/*
 * Module to move mouse
 * @type Module robotjs|Module robotjs
 */
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
/**
 * Module to train SVM
 * @type Module node-svm|Module node-svm
 */
var svm = require('node-svm');
// initialize a new predictor 
var clf = new svm.CSVC();
// check if SVM has already trained ( for asynchronous process
var SVMtrained = false;
//check if training process started (not to start it again)
var startedTraining = false;
// normalize absolute beta power values
var dataToTrainSVM = [];
//check if needed electrodes get good signal
var isGoodSignal = false;
var blink = false;
var notTouchingForehead = false;
var jawClench = false;
// pause in training between left and right
var pause = 0;
var pauseTime = 20;
//normalized data for training
var normalizedValues = [];
var maxAbsoluteValue = 2;
var minAbsoluteValue = 1;//we add 1 to electrode value
// if true then we do not controll mouse 
var stoppedControl = false; 
function trainSVM(data) {
    clf.train(data).done(function () {
        SVMtrained = true;
    });
}

function predictSVM(data) {
    //console.log(clf);
    var prediction = clf.predictSync(data);
    return prediction;
}

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
 predictSVM([0,1]);
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
   //  socket.on("actions", function (action) {
        // we received a tweet from the browser

  //      console.log(action);
  //  });
    // Listen for incoming OSC bundles.
    udpPort.on("message", function (oscData) {
        now = Date.now()
        if ((now - lastPointTime <= 2000) || (lastPointTime - now <= 2000)) {
            lastPointTime = now;
            if (oscData.address == "/muse/elements/beta_absolute") {
                if (oscData.args[1] != "0" && oscData.args[2] != "0" && isGoodSignal == true) {
                    if (SVMtrained == false) {
                        if (dataToTrainSVM.length < 100) {
                            console.log('Think right');
                            normalizedValues = [(oscData.args[1] + minAbsoluteValue) / (maxAbsoluteValue+minAbsoluteValue), (oscData.args[2] + minAbsoluteValue) / (maxAbsoluteValue+minAbsoluteValue)];
                            dataToTrainSVM.push([normalizedValues, 1]);
                            socket.emit('train', {"attr": "train", "side": "right", "value": [normalizedValues, 1]});
                        } else if (pause < pauseTime) {
                            //give user some time to concentrate on other side
                            pause += 1;
                        } else if (dataToTrainSVM.length < (200 + pauseTime)) {
                            console.log('Think left');
                            normalizedValues = [(oscData.args[1] + minAbsoluteValue) / (maxAbsoluteValue+minAbsoluteValue), (oscData.args[2] + minAbsoluteValue) / (maxAbsoluteValue+minAbsoluteValue)];
                            dataToTrainSVM.push([normalizedValues, 0]);
                            socket.emit('train', {"attr": "train", "side": "left", "value": [normalizedValues, 0]});
                        } else {
                            if (startedTraining == false) {
                                console.log('Training network...');
                                trainSVM(dataToTrainSVM);
                                startedTraining = true;
                            }
                        }

                    } else if(stoppedControl == false) {
                        var answer = predictSVM([oscData.args[1], oscData.args[2]]);
                        if (answer > 0) {
                            moveMouse(50, 200);
                            normalizedValues = [(oscData.args[1] + minAbsoluteValue) / (maxAbsoluteValue+minAbsoluteValue), (oscData.args[2] + minAbsoluteValue) / (maxAbsoluteValue+minAbsoluteValue)];
                            socket.emit('train', {"attr": "test", "side": "right", "value": [normalizedValues, 0]});
                        } else {
                            moveMouse(-50, 200);
                            socket.emit('train', {"attr": "test", "side": "left", "value": [normalizedValues, 0]});
                        }
                        console.log('answer:', answer);
                    }
                }
                return;
            } else if (oscData.address == '/muse/elements/is_good') {
                tempIsGoodSignal = isGoodSignal;
                //vice versa because if argument is true the button will became orange
                // console.log(oscData.args[1],oscData.args[2],"oscData.args[1]");
                if (oscData.args[1] == "1" && oscData.args[2] == "1" && blink == false) {
                    isGoodSignal = true;
                } else {console.log("bad",oscData.args[1] ,oscData.args[2] );
                    isGoodSignal = false;
                }
                //     if (tempBadSignal != badSignal) {
                socket.emit('train', {"attr": "good_signal", "value": [oscData.args[0], oscData.args[1], oscData.args[2], oscData.args[3]]});
                //   }
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
            } else if (oscData.address == '/muse/config') {
                socket.emit('train', {"attr": "battery", "value": oscData.args.battery_percent_remaining});
            }//console.log(oscData.address);
        }
    });

});

var port = Number(process.env.PORT || 3000);
server.listen(port, function () {
    console.log("Listening on " + port);
});

/**
 * Listen for keypress to stop or start controlling mouse by typing "y" letter
 */
var keypress = require('keypress');
 
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  if (key && key.name == 'y') {
      if(stoppedControl == true){
          stoppedControl = false;
      }else{
          stoppedControl = true;
      }
    process.stdin.pause();
  }
});
 
process.stdin.setRawMode(true);
process.stdin.resume();
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
var demo = false;
//set process to demo version without muse
process.argv.forEach(function (val, index, array) {
    if (val == "demo") {
        demo = true;
    }
});
/**
 * Module to train SVM
 * @type Module node-svm|Module node-svm
 */
var svm = require('node-svm');
// initialize a new predictor 
var clf = new svm.CSVC();
// check if SVM has already trained ( for asynchronous process
var SVMtrained = 0;
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
/*
 * Socket params
 */
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

function predictSVM(data) {
    //console.log(clf);
    var prediction = clf.predictSync(data);
    return prediction;
}
function trainSVM(data) {
    //  console.log(data,"data");
    clf.train(data).done(function () {
        SVMtrained = 1;
    });
}

//get data of DECISION BOUNDARY

var linspace = require('linspace');
function dataForBoundaries(data) {

    //get min and max of all(for now 2) features
    //  $.each(data, function (row) {

    //  });
    var min = [1, 1];
    var max = [0, 0];
    for (var i = 0; i < data.length; i++) {
        for (var n = 0; n < 2; n++) {
            //console.log(data[i]);
            if (min[n] > data[i][0][n]) {
                min[n] = data[i][0][n];
            } else if (max[n] < data[i][0][n]) {
                max[n] = data[i][0][n];
            }
        }
    }
    //  var max_of_array = Math.max.apply(Math, array);
    var x1plot = linspace(min[0] - 0.1, max[0] + 0.1, 50);
    var x2plot = linspace(min[1] - 0.1, max[1] + 0.1, 50);
    var boundaries = [];
    for (var i = 0; i < (x1plot.length - 1); i++) {
        for (var n = 0; n < (x2plot.length - 1); n++) {
            boundaries.push([[x1plot[i], x2plot[n]], predictSVM([x1plot[i], x2plot[n]])]);
        }
    }
    //  console.log(boundaries, 'boundaries',min,max);
    return boundaries;
}
if (demo == true) {
    var data = [[[0.6987143357594808, 0.5366357366243998], 1],
        [[0.704694668451945, 0.537489632765452], 1],
        [[0.704694668451945, 0.537489632765452], 1],
        [[0.7126544713973999, 0.5387784441312155], 1],
        [[0.7126544713973999, 0.5387784441312155], 1],
        [[0.7210434675216675, 0.5405356287956238], 1],
        [[0.7210434675216675, 0.5405356287956238], 1],
        [[0.7283021211624146, 0.5424253940582275], 1],
        [[0.7283021211624146, 0.5424253940582275], 1],
        [[0.7334237893422445, 0.5438121954600016], 1],
        [[0.7334237893422445, 0.5438121954600016], 1],
        [[0.7364020744959513, 0.543846845626831], 1],
        [[0.7364020744959513, 0.543846845626831], 1],
        [[0.7380975484848022, 0.54041854540507], 1],
        [[0.7380975484848022, 0.54041854540507], 1],
        [[0.7394919395446777, 0.5308151841163635], 1],
        [[0.7394919395446777, 0.5308151841163635], 1],
        [[0.7409084240595499, 0.5132184227307638], 1],
        [[0.7409084240595499, 0.5132184227307638], 1],
        [[0.7422834634780884, 0.48848873376846313], 1],
        [[0.7422834634780884, 0.48848873376846313], 1],
        [[0.7431739171346029, 0.4613312582174937], 1],
        [[0.7431739171346029, 0.4613312582174937], 1],
        [[0.7432105938593546, 0.4396926462650299], 1],
        [[0.7432105938593546, 0.4396926462650299], 1],
        [[0.7424440383911133, 0.42874111731847125], 1],
        [[0.7424440383911133, 0.42874111731847125], 1],
        [[0.740947445233663, 0.42677316069602966], 1],
        [[0.740947445233663, 0.42677316069602966], 1],
        [[0.738223155339559, 0.4282989799976349], 1],
        [[0.738223155339559, 0.4282989799976349], 1],
        [[0.7337943315505981, 0.4293352961540222], 1],
        [[0.7337943315505981, 0.4293352961540222], 1],
        [[0.7276866833368937, 0.42846837639808655], 1],
        [[0.7276866833368937, 0.42846837639808655], 1],
        [[0.7210202614466349, 0.4255075653394063], 1],
        [[0.7210202614466349, 0.4255075653394063], 1],
        [[0.7151222229003906, 0.421866238117218], 1],
        [[0.7151222229003906, 0.421866238117218], 1],
        [[0.7105815013249716, 0.41967394948005676], 1],
        [[0.7105815013249716, 0.41967394948005676], 1],
        [[0.7069123983383179, 0.42039982477823895], 1],
        [[0.7069123983383179, 0.42039982477823895], 1],
        [[0.7034294207890829, 0.4241805672645569], 1],
        [[0.7034294207890829, 0.4241805672645569], 1],
        [[0.7005073626836141, 0.429486741622289], 1],
        [[0.7005073626836141, 0.429486741622289], 1],
        [[0.6991899410883585, 0.43394073843955994], 1],
        [[0.6991899410883585, 0.43394073843955994], 1],
        [[0.6999975840250651, 0.4359019696712494], 1],
        [[0.6999975840250651, 0.4359019696712494], 1],
        [[0.7024344603220621, 0.4349290430545807], 1],
        [[0.7024344603220621, 0.4349290430545807], 1],
        [[0.7053241729736328, 0.43183539311091107], 1],
        [[0.7053241729736328, 0.43183539311091107], 1],
        [[0.7075114250183105, 0.4281730651855469], 1],
        [[0.7075114250183105, 0.4281730651855469], 1],
        [[0.7084305286407471, 0.42564746737480164], 1],
        [[0.7084305286407471, 0.42564746737480164], 1],
        [[0.7081966797510783, 0.42499696214993793], 1],
        [[0.7081966797510783, 0.42499696214993793], 1],
        [[0.707196831703186, 0.42587219675381977], 1],
        [[0.707196831703186, 0.42587219675381977], 1],
        [[0.7063368956247965, 0.4277926981449127], 1],
        [[0.7063368956247965, 0.4277926981449127], 1],
        [[0.70659871896108, 0.43062061071395874], 1],
        [[0.70659871896108, 0.43062061071395874], 1],
        [[0.727951447168986, 0.46616820494333905], 0],
        [[0.727951447168986, 0.46616820494333905], 0],
        [[0.7307434876759847, 0.47331351041793823], 0],
        [[0.7307434876759847, 0.47331351041793823], 0],
        [[0.7341017325719198, 0.48223666350046795], 0],
        [[0.7341017325719198, 0.48223666350046795], 0],
        [[0.7372076511383057, 0.492266724507014], 0],
        [[0.7372076511383057, 0.492266724507014], 0],
        [[0.7392055988311768, 0.501713236172994], 0],
        [[0.7392055988311768, 0.501713236172994], 0],
        [[0.7393169403076172, 0.5092166066169739], 0],
        [[0.7393169403076172, 0.5092166066169739], 0],
        [[0.7369751135508219, 0.5142496426900228], 0],
        [[0.7369751135508219, 0.5142496426900228], 0],
        [[0.7320854663848877, 0.5172105431556702], 0],
        [[0.7320854663848877, 0.5172105431556702], 0],
        [[0.72520379225413, 0.518415113290151], 0],
        [[0.72520379225413, 0.518415113290151], 0],
        [[0.7173788150151571, 0.5183834433555603], 0],
        [[0.7173788150151571, 0.5183834433555603], 0],
        [[0.7102124293645223, 0.5173456271489462], 0],
        [[0.7102124293645223, 0.5173456271489462], 0],
        [[0.7051783005396525, 0.5154236356417338], 0],
        [[0.7051783005396525, 0.5154236356417338], 0],
        [[0.7029501994450887, 0.5126628279685974], 0],
        [[0.7029501994450887, 0.5126628279685974], 0],
        [[0.70290740331014, 0.5090429385503134], 0],
        [[0.70290740331014, 0.5090429385503134], 0],
        [[0.7038571039835612, 0.5044390360514323], 0],
        [[0.7038571039835612, 0.5044390360514323], 0],
        [[0.7048185269037882, 0.4988187253475189], 0],
        [[0.7048185269037882, 0.4988187253475189], 0],
        [[0.7053687572479248, 0.49185951550801593], 0],
        [[0.7053687572479248, 0.49185951550801593], 0],
        [[0.705495556195577, 0.4829709231853485], 0],
        [[0.705495556195577, 0.4829709231853485], 0],
        [[0.7052892843882242, 0.4719642400741577], 0],
        [[0.7052892843882242, 0.4719642400741577], 0],
        [[0.705115795135498, 0.4591815173625946], 0],
        [[0.705115795135498, 0.4591815173625946], 0],
        [[0.7056428591410319, 0.44480355580647785], 0],
        [[0.7056428591410319, 0.44480355580647785], 0],
        [[0.7082551717758179, 0.4290987153848012], 0],
        [[0.7082551717758179, 0.4290987153848012], 0],
        [[0.7133661905924479, 0.41239500045776367], 0],
        [[0.7133661905924479, 0.41239500045776367], 0],
        [[0.7200566927591959, 0.3968313932418823], 0],
        [[0.7200566927591959, 0.3968313932418823], 0],
        [[0.7267643213272095, 0.38479696214199066], 0],
        [[0.7267643213272095, 0.38479696214199066], 0],
        [[0.7320971488952637, 0.37776053448518115], 0],
        [[0.7320971488952637, 0.37776053448518115], 0],
        [[0.735427180926005, 0.37483755002419156], 0],
        [[0.735427180926005, 0.37483755002419156], 0],
        [[0.7365386088689169, 0.3739371175567309], 0],
        [[0.7365386088689169, 0.3739371175567309], 0],
        [[0.7355079253514608, 0.3738885596394539], 0],
        [[0.7355079253514608, 0.3738885596394539], 0],
        [[0.7325354814529419, 0.37464434405167896], 0],
        [[0.7325354814529419, 0.37464434405167896], 0],
        [[0.7280247608820597, 0.3753232806921005], 0],
        [[0.7280247608820597, 0.3753232806921005], 0],
        [[0.7224198579788208, 0.37438541899124783], 0],
        [[0.7224198579788208, 0.37438541899124783], 0],
        [[0.7163885037104288, 0.3708333546916644], 0],
        [[0.7163885037104288, 0.3708333546916644], 0],
        [[0.7108400265375773, 0.36576921741167706], 0],
        [[0.7108400265375773, 0.36576921741167706], 0],
        [[0.7063508033752441, 0.36192233860492706], 0],
        [[0.7063508033752441, 0.36192233860492706], 0],
        [[0.702794631322225, 0.36195065826177597], 0],
        [[0.702794631322225, 0.36195065826177597], 0],
        [[0.6989176670710245, 0.3654575248559316], 0],
        [[0.6989176670710245, 0.3654575248559316], 0],
        [[0.6938438812891642, 0.369978129863739], 0],
        [[0.6938438812891642, 0.369978129863739], 0],
        [[0.6875231663386027, 0.3732391993204753], 0],
        [[0.6875231663386027, 0.3732391993204753], 0],
        [[0.6807211637496948, 0.3741792341073354], 0],
        [[0.6807211637496948, 0.3741792341073354], 0],
        [[0.6745001872380575, 0.37320078412691754], 0],
        [[0.6745001872380575, 0.37320078412691754], 0],
        [[0.6694456736246744, 0.37130822489658993], 0],
        [[0.6694456736246744, 0.37130822489658993], 0],
        [[0.6656873822212219, 0.3690705994764964], 0],
        [[0.6656873822212219, 0.3690705994764964], 0],
        [[0.6628294189771017, 0.36640449116627377], 0],
        [[0.6628294189771017, 0.36640449116627377], 0],
        [[0.6607981522878011, 0.36272285381952923], 0],
        [[0.6607981522878011, 0.36272285381952923], 0],
        [[0.6597613096237183, 0.3581545799970627], 0],
        [[0.6597613096237183, 0.3581545799970627], 0],
        [[0.6600865721702576, 0.35401516407728195], 0],
        [[0.6600865721702576, 0.35401516407728195], 0],
        [[0.661599338054657, 0.35263141120473546], 0],
        [[0.661599338054657, 0.35263141120473546], 0],
        [[0.6634448369344076, 0.35514506697654724], 0],
        [[0.6634448369344076, 0.35514506697654724], 0],
        [[0.664714535077413, 0.36022331565618515], 0],
        [[0.664714535077413, 0.36022331565618515], 0],
        [[0.665003259976705, 0.3653517837325732], 0],
        [[0.665003259976705, 0.3653517837325732], 0],
        [[0.6644225716590881, 0.36897963533798855], 0],
        [[0.6644225716590881, 0.36897963533798855], 0],
        [[0.6630700826644897, 0.3716105992595355], 0],
        [[0.6630700826644897, 0.3716105992595355], 0],
        [[0.6608712673187256, 0.3743866706887881], 0],
        [[0.6608712673187256, 0.3743866706887881], 0],
        [[0.6578817963600159, 0.3782604932785034], 0],
        [[0.6578817963600159, 0.3782604932785034], 0],
        [[0.6543068289756775, 0.3830612649520238], 0],
        [[0.6543068289756775, 0.3830612649520238], 0],
        [[0.6508049766222636, 0.3878341019153595], 0],
        [[0.6508049766222636, 0.3878341019153595], 0],
        [[0.648418923219045, 0.3918320834636688], 0],
        [[0.648418923219045, 0.3918320834636688], 0],
        [[0.648713747660319, 0.39479610820611316], 0],
        [[0.648713747660319, 0.39479610820611316], 0],
        [[0.6524218718210856, 0.3971313734849294], 0],
        [[0.6524218718210856, 0.3971313734849294], 0]];
    console.log("Demo:");
    trainSVM(data);
    io.on('connection', function (socket) {
        for (var index = 0; index < (data.length - 1); index++) {
            if (data[index][1] == 1) {
                socket.emit('train', {"attr": "train", "side": "right", "value": data[index][0]});
            } else {
                socket.emit('train', {"attr": "train", "side": "left", "value": data[index][0]});
            }
        }
        socket.emit('train', {"attr": "boundary", "value": dataForBoundaries(data)});
    });
} else {
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
                        if (SVMtrained == 0) {
                            if (dataToTrainSVM.length < 100) {
                                console.log('Think right');
                                normalizedValues = [(oscData.args[1] + minAbsoluteValue) / (maxAbsoluteValue + minAbsoluteValue), (oscData.args[2] + minAbsoluteValue) / (maxAbsoluteValue + minAbsoluteValue)];
                                dataToTrainSVM.push([normalizedValues, 1]);
                                socket.emit('train', {"attr": "train", "side": "right", "value": normalizedValues});
                            } else if (pause < pauseTime) {
                                //give user some time to concentrate on other side
                                pause += 1;
                                console.log('Start think left');
                            } else if (dataToTrainSVM.length < (200 + pauseTime)) {
                                console.log('Think left');
                                normalizedValues = [(oscData.args[1] + minAbsoluteValue) / (maxAbsoluteValue + minAbsoluteValue), (oscData.args[2] + minAbsoluteValue) / (maxAbsoluteValue + minAbsoluteValue)];
                                dataToTrainSVM.push([normalizedValues, 0]);
                                socket.emit('train', {"attr": "train", "side": "left", "value": normalizedValues});
                            } else {
                                if (startedTraining == false) {
                                    console.log('Training network...');
                                    trainSVM(dataToTrainSVM);
                                    startedTraining = true;
                                }
                            }

                        } else if (stoppedControl == false) {
                            if (SVMtrained == 1) {
                                console.log('Network trained');
                                socket.emit('train', {"attr": "boundary", "value": dataForBoundaries(dataToTrainSVM)});
                                SVMtrained = 2;
                            }
                            var answer = predictSVM([oscData.args[1], oscData.args[2]]);
                            normalizedValues = [(oscData.args[1] + minAbsoluteValue) / (maxAbsoluteValue + minAbsoluteValue), (oscData.args[2] + minAbsoluteValue) / (maxAbsoluteValue + minAbsoluteValue)];
                            if (answer > 0) {
                                moveMouse(50, 200);
                                socket.emit('train', {"attr": "test", "side": "right", "value": normalizedValues});
                            } else {
                                moveMouse(-50, 200);
                                socket.emit('train', {"attr": "test", "side": "left", "value": normalizedValues});
                            }
                            //      console.log('answer:', answer);
                        }
                    }
                    return;
                } else if (oscData.address == '/muse/elements/is_good') {
                    tempIsGoodSignal = isGoodSignal;
                    //vice versa because if argument is true the button will became orange
                    // console.log(oscData.args[1],oscData.args[2],"oscData.args[1]");
                    if (oscData.args[1] == "1" && oscData.args[2] == "1" && blink == false) {
                        isGoodSignal = true;
                    } else {
                        //  console.log("bad", oscData.args[1], oscData.args[2]);
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
}

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
    if (key && key.name == 'y') {
        if (stoppedControl == true) {
            stoppedControl = false;
        } else {
            console.log('sustabde');
            stoppedControl = true;
        }
        process.stdin.pause();
    }
});

//process.stdin.setRawMode(true);
//process.stdin.resume();
var controllActions = require('./actions/index')
var connection = require('./connections/index')
var svm = require('./dataAnalysis/index')
var SvmModule = new svm.SvmModule;
connection.udpPort.open();
MuseModule = new connection.MuseModule();
var demo = false;
//set process to demo version without muse
process.argv.forEach(function (val, index, array) {
    if (val == "demo") {
        demo = true;
    }
    if (val == "start_training") {
        MuseModule.setStartTraining(true);
    }
});
var sentToDb = false;
if (demo == true) {
    var fs = require('fs');
    var data = JSON.parse(fs.readFileSync('demoData.json', 'utf8'));
    console.log("Demo:");
    SvmModule.trainSVM(data);
    connection.io.on('connection', function (socket) {
        for (var index = 0; index < (data.length - 1); index++) {
            if (data[index][1] == 1) {
                socket.emit('train', {"attr": "train", "side": "right", "value": data[index][0]});
            } else {
                socket.emit('train', {"attr": "train", "side": "left", "value": data[index][0]});
            }
        }
        socket.emit('train', {"attr": "boundary", "value": SvmModule.dataForBoundaries(data)});


        socket.on("actions", function (action) {
            console.log(action, "action");
            if (action == 'save_data' && sentToDb == false) {
                connection.sendDataToDb(MuseModule.getTrainingData());
                sentToDb = true;
            }
        });
    });
} else {
    connection.io.on('connection', function (socket) {
        console.log("socket.io connection");
        socket.on("actions", function (action) {
            console.log(action, "action");
            if (action == 'startTraining') {
                MuseModule.setStartTraining(true);
            } else if (action == 'start_stop') {
                if (MuseModule.getStoppedControll() == false) {
                    MuseModule.setStoppedControll(true);
                } else {
                    MuseModule.setStoppedControll(false);
                }
            } else if (action == 'save_data') {
                connection.sendDataToDb(MuseModule.getTrainingData());
            }
        });
        // Listen for incoming OSC bundles.
        connection.udpPort.on("message", function (oscData) {
            MuseModule.listenMuse(oscData, socket, controllActions, SvmModule);
        });

    });
}

var port = Number(process.env.PORT || 3000);

connection.server.listen(port, function () {
    console.log("Listening on " + port);
});

controllActions.stopStartActions(MuseModule);

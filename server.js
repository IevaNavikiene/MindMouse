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
	var side;
    connection.io.on('connection', function (socket) {
        for (var index = 0; index < (data.length - 1); index++) {
			side = "left";
            if (data[index][1] == 1) {
				side = "right";
            }
			socket.emit('train', {"attr": "train", "side": side, "value": data[index][0]});
        }
		socket.emit('train', {"attr": "boundary", "value": SvmModule.dataForBoundaries(data)});
    });
} else {
    connection.io.on('connection', function (socket) {
        console.log("socket.io connection");
        socket.on("actions", function (action) {
            console.log(action, "action");
            if (action == 'startTraining') {
                MuseModule.setStartTraining(true);
            } else if (action == 'start_stop') {
                MuseModule.changeMouseControllSetting();
            } else if (action == 'save_data') {
                //connection.sendDataToDb(MuseModule.getTrainingData());
				//MuseModule.changeMouseControllSetting();
            } else if (action == 'boundary') {//draw decision boundary manually
				SvmModule.setSVMtrained(1);
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

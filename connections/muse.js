var now;
var MuseModule = function () {
    this.lastPointTime = Date.now();
    this.dataToTrainSVM = [];    // normalize absolute beta power values
    this.blink = false;
    this.jawClench = false;
    this.notTouchingForehead = false;
    //check if needed electrodes get good signal
    this.isGoodSignal = false;

    // pause in training between left and right
    this.pause = 0;
    this.pauseTime = 20;
    //normalized data for training
    this.normalizedValues = [];
    this.maxAbsoluteValue = 2;
    this.minAbsoluteValue = 1;//we add 1 to electrode value
    this.startTraining = false; //allows to initialize training from browser
    this.startedTraining = false; //check if training process started (not to start it again)
    this.stoppedControl = true;// if true then we do not controll mouse 
};
MuseModule.prototype.listenMuse = function (oscData, socket, controllActions, svm) {
    now = Date.now();
    var param; // initialize param for batery json array
    if ((now - this.lastPointTime <= 2000) || (this.lastPointTime - now <= 2000)) {
        this.lastPointTime = now;
        if (oscData.address == "/muse/elements/beta_absolute") {
            if (oscData.args[1] != "0" && oscData.args[2] != "0" && this.isGoodSignal == true) {
                if (svm.getSVMtrained() == 0) {
                    if (this.startTraining === false) {
                        return;
                    }
                    if (this.dataToTrainSVM.length < 100) {
                        console.log('Think right');
                        this.normalizedValues = [(oscData.args[1] + this.minAbsoluteValue) / (this.maxAbsoluteValue + this.minAbsoluteValue), (oscData.args[2] + this.minAbsoluteValue) / (this.maxAbsoluteValue + this.minAbsoluteValue)];
                        this.dataToTrainSVM.push([this.normalizedValues, 1]);
                        socket.emit('train', {"attr": "train", "side": "right", "value": this.normalizedValues});
                    } else if (this.pause < this.pauseTime) {
                        //give user some time to concentrate on other side
                        this.pause += 1;
                        console.log('Start think left');
                    } else if (this.dataToTrainSVM.length < (200 + this.pauseTime)) {
                        console.log('Think left');
                        this.normalizedValues = [(oscData.args[1] + this.minAbsoluteValue) / (this.maxAbsoluteValue + this.minAbsoluteValue), (oscData.args[2] + this.minAbsoluteValue) / (this.maxAbsoluteValue + this.minAbsoluteValue)];
                        this.dataToTrainSVM.push([this.normalizedValues, 0]);
                        socket.emit('train', {"attr": "train", "side": "left", "value": this.normalizedValues});
                    } else {
                        if (this.startedTraining == false) {
                            console.log('Training network...');
                            svm.trainSVM(this.dataToTrainSVM);
                            this.startedTraining = true;
                        }
                    }
                } else if (this.stoppedControl == false) {
                    if (svm.getSVMtrained() == 1) {
                        console.log('Network trained');
                        socket.emit('train', {"attr": "boundary", "value": svm.dataForBoundaries(this.dataToTrainSVM)});
                        svm.setSVMtrained(2);
                    }
                    this.normalizedValues = [(oscData.args[1] + this.minAbsoluteValue) / (this.maxAbsoluteValue + this.minAbsoluteValue), (oscData.args[2] + this.minAbsoluteValue) / (this.maxAbsoluteValue + this.minAbsoluteValue)];
                    var answer = svm.predictSVM(this.normalizedValues);
                    if (answer > 0) {
                        controllActions.moveMouse(50, 200);
                        socket.emit('train', {"attr": "test", "side": "right", "value": this.normalizedValues});
                    } else {
                        controllActions.moveMouse(-50, 200);
                        socket.emit('train', {"attr": "test", "side": "left", "value": this.normalizedValues});
                    }
                    //      console.log('answer:', answer);
                }
            }
            return;
        } else if (oscData.address == '/muse/elements/is_good') {
            if (oscData.args[1] == "1" && oscData.args[2] == "1" && this.blink == false) {
                this.isGoodSignal = true;
            } else {
                this.isGoodSignal = false;
            }
            socket.emit('train', {"attr": "good_signal", "value": [oscData.args[0], oscData.args[1], oscData.args[2], oscData.args[3]]});
        } else if (oscData.address == '/muse/elements/blink') {
            tempBlink = this.blink;

            if (oscData.args == "1") {
                this.blink = true;
            } else {
                this.blink = false;
            }
            if (this.blink != tempBlink) {
                socket.emit('train', {"attr": "blink", "value": this.blink});
            }
        } else if (oscData.address == '/muse/elements/jaw_clench') {
            tempJawClench = this.jawClench;
            if (oscData.args == "1") {
                this.jawClench = true;
            } else {
                this.jawClench = false;
            }
            if (this.jawClench != tempJawClench) {
                socket.emit('train', {"attr": "jaw_clench", "value": this.jawClench});
            }
        } else if (oscData.address == '/muse/elements/touching_forehead') {
            tempNotTouchingForehead = this.notTouchingForehead;
            //vice versa because if argument is true the button will became orange
            if (oscData.args == "1") {
                this.notTouchingForehead = false;
            } else {
                this.notTouchingForehead = true;
            }
            if (this.notTouchingForehead != tempNotTouchingForehead) {
                socket.emit('train', {"attr": "touching_forehead", "value": this.notTouchingForehead});
            }
        } else if (oscData.address == '/muse/config') {
            param = JSON.parse(oscData.args[0]);
            socket.emit('train', {"attr": "battery", "value": param.battery_percent_remaining});
        }//console.log(oscData.address);
    }
};

MuseModule.prototype.setStoppedControll = function setStoppedControll(boolValue) {
    this.stoppedControll = boolValue;
};
MuseModule.prototype.getStoppedControll = function getStoppedControll() {
    return this.stoppedControll;
}
MuseModule.prototype.setStartTraining = function setStartTraining(boolValue) {
    this.startTraining = boolValue;
};
MuseModule.prototype.getStartTraining = function getStartTraining() {
    return this.startTraining;
}
MuseModule.prototype.getTrainingData = function getTrainingData() {
    return this.dataToTrainSVM;
}

module.exports.MuseModule = MuseModule;
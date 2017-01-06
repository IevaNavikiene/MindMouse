/**
 * Module to train SVM
 * @type Module node-svm|Module node-svm
 */
var svm = require('node-svm');
var linspace = require('linspace');
// initialize a new predictor 
var clf = new svm.CSVC();

//it is global variable because we don't have jquery here
var SVMtrained = 0;
// check if SVM has already trained ( for asynchronous process
var SvmModule = function () {};
SvmModule.prototype.predictSVM = function (data) {
    var prediction = clf.predictSync(data);
    return prediction;
}
SvmModule.prototype.trainSVM = function (data) {
    clf.train(data).done(function () {
        SVMtrained = 1;
    });
}

//get data of DECISION BOUNDARY
SvmModule.prototype.dataForBoundaries = function (data) {
    //get min and max of all(for now 2) features
    var min = [1, 1];
    var max = [0, 0];
    for (var i = 0; i < data.length; i++) {
        for (var n = 0; n < 2; n++) {
            if (min[n] > data[i][0][n]) {
                min[n] = data[i][0][n];
            } else if (max[n] < data[i][0][n]) {
                max[n] = data[i][0][n];
            }
        }
    }
    //  var max_of_array = Math.max.apply(Math, array);
    var x1plot = linspace(min[0] - 0.1, max[0] + 0.1, 30);
    var x2plot = linspace(min[1] - 0.1, max[1] + 0.1, 30);
	var boundaries = [];
    for (var i = 0; i < (x1plot.length - 1); i++) {
        for (var n = 0; n < (x2plot.length - 1); n++) {
            boundaries.push([[(x1plot[i]).toFixed(2), (x2plot[n]).toFixed(2)], this.predictSVM([x1plot[i], x2plot[n]])]);
        }
		
    }
	return boundaries;
}
SvmModule.prototype.getSVMtrained = function () {
    return SVMtrained;
}
SvmModule.prototype.setSVMtrained = function (value) {
    SVMtrained = value;
}
module.exports.SvmModule = SvmModule;

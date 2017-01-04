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
function stopStartActions(MuseModule) {
    /**
     * Listen for keypress to stop or start controlling mouse by typing "y" letter
     */
    var keypress = require('keypress');

// make `process.stdin` begin emitting "keypress" events 
    keypress(process.stdin);
// listen for the "keypress" event 
    process.stdin.on('keypress', function (ch, key) {
        if (key && key.name == 'y') {
            if (MuseModule.getStoppedControll() == true) {
                MuseModule.setStoppedControll(false);
            } else {
                MuseModule.setStoppedControll(true);
            }
            process.stdin.pause();
        }
    });

//process.stdin.setRawMode(true);
//process.stdin.resume();
}
module.exports.moveMouse = moveMouse;
module.exports.stopStartActions = stopStartActions;
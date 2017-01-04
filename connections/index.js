/*
 * Socket params
 */
var express = require('express');
var app = express();
//var redis = require('redis')
var osc = require('osc')

var server = require('http').Server(app);
var io = require('socket.io')(server);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
var muse = require('./muse')
var trueinsight = require('./trueInsight')

module.exports = {
    udpPort: new osc.UDPPort({
        localAddress: "127.0.0.1",
        localPort: 5000
    }),
    io: io,
    server: server,
    MuseModule: muse.MuseModule,
    sendDataToDb: trueinsight.sendDataToDb
};


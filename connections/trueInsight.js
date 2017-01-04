
/*var querystring = require('querystring');
 var http = require('http');
 var fs = require('fs');
 function sendDataToDb(data) {
 data = '[aaaaa]';console.log('pateko i sendDataToDb');
 var options = {
 host: 'http://dejected.lt/',
 port: 80,
 path: '/saveMindMouseData?data=',
 method: 'POST',
 headers: {
 'Content-Type': 'application/x-www-form-urlencoded',
 'Content-Length': Buffer.byteLength(data)
 }
 };
 
 http.request(options, function (res) {
 console.log('STATUS: ' + res.statusCode);
 console.log('HEADERS: ' + JSON.stringify(res.headers));
 res.setEncoding('utf8');
 res.on('data', function (chunk) {
 console.log('BODY: ' + chunk);
 });
 }).end();
 }
 */
// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
function sendDataToDb(data) {
 //  data = '[aaaaa1]';
    // Build the post string from an object
    var post_data = querystring.stringify({
        'data': data
    });
//console.log(post_data);
    // An object of options to indicate where to post to
    var post_options = {
        host: 'dejected.lt',
        //port: '80',
        path: '/saveMindMouseData?data=' + data,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

}
module.exports.sendDataToDb = sendDataToDb;
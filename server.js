var zerorpc = require("zerorpc");
var http = require('http');
var url = require('url');
 
// http.createServer(function (req, res) {        
// 　　    console.log(req);
//     }).listen(8888, "127.0.0.1");

 var client = new zerorpc.Client();
 client.connect("tcp://127.0.0.1:4242");

 client.invoke("hello", "100,300", function(error, res, more) {
     console.log(res);
 });
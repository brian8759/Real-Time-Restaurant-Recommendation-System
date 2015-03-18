
/*
 * GET home page.
 */
var zerorpc = require("zerorpc");

var client = new zerorpc.Client();

client.connect("tcp://127.0.0.1:4242");

exports.index = function(req, res){
  res.render('index', { title: 'Real Time Restaurant Recommendation System' });
};

exports.sendKeyWord = function(req, res) {
  var request = req.body.msg;	
  console.log(request);
  client.invoke("hello", request, function(error, ret) {
    console.log(ret);
    res.json(ret);
  });
};
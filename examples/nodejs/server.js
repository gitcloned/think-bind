
var http = require("http")
	, fs = require("fs");

var json = function (name) {

	//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
	var options = {
	  host: 'www.random.org',
	  path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
	};

	callback = function(response) {
	  var str = '';

	  //another chunk of data has been recieved, so append it to `str`
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  //the whole response has been recieved, so we just print it out here
	  response.on('end', function () {
	    console.log(str);
	  });
	}

	http.request(options, callback).end();
}

http.createServer(function (req, res) {
	
	console.log("received req %s", req.url);

	var name = req.url.split("/");
	name = name[name.length - 1];


}).listen(5000);
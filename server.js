var http = require("http");
var url = require("url");

exports.start = function (route) {
    function onRequest(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("request for " + pathname + " recieved");

	route(pathname);
	
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("Hello World");
	response.end();
    }
    http.createServer(onRequest).listen(8888);
    console.log("server started");
}

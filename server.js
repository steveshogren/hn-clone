var http = require("http");

exports.start = function () {
    function onRequest(request, response) {
	console.log("request recieved");
	
	  response.writeHead(200, {"Content-Type": "text/plain"});
	  response.write("Hello World");
	  response.end();
    }
    http.createServer(onRequest).listen(8888);
    console.log("server started");
}

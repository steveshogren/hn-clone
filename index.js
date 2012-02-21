var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.createNewPost;
handle["/start"] = requestHandlers.createNewPost;
handle["/upload"] = requestHandlers.uploadPost;
handle["/showPost"] = requestHandlers.showPost;

server.start(router.route, handle);
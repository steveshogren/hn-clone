var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.createNewPost;
handle["/createNewPost"] = requestHandlers.createNewPost;
handle["/uploadPost"] = requestHandlers.uploadPost;
handle["/showPost"] = requestHandlers.showPost;
handle["/upvotePost"] = requestHandlers.upvotePost;

server.start(router.route, handle);
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.createNewPostPage;
handle["/createNewPost"] = requestHandlers.createNewPostPage;
handle["/uploadPost"] = requestHandlers.uploadPost;
handle["/showPost"] = requestHandlers.showPost;
handle["/upvotePost"] = requestHandlers.upvotePost;
handle["/updatePost"] = requestHandlers.updatePost;

server.start(router.route, handle);
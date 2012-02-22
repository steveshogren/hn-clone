var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.showMainPage;
handle["/createNewPost"] = requestHandlers.createNewPostPage;
handle["/createPost"] = requestHandlers.createPost;
handle["/showPost"] = requestHandlers.showPost;
handle["/upvotePost"] = requestHandlers.upvotePost;
handle["/updatePost"] = requestHandlers.updatePost;

server.start(router.route, handle);
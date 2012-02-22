var server = require("./server"),
    router = require("./router"),
    requestHandlers = require("./requestHandlers"),
    view = require("./view");

var handle = {}
handle["/"] = requestHandlers.showMainPage;
handle["/createNewPost"] = view.createNewPostPage;
handle["/createPost"] = requestHandlers.createPost;
handle["/showPost"] = requestHandlers.showPost;
handle["/upvotePost"] = requestHandlers.upvotePost;
handle["/updatePost"] = requestHandlers.updatePost;

server.start(router.route, handle);
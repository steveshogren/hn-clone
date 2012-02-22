var querystring = require("querystring"),
    url = require("url"),
    formidable = require("formidable"),
    redis = require("redis"),
    post = require("./post"),
    view = require("./view");


exports.createPost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        post.createPost(JSON.stringify(fields.title), JSON.stringify(fields.link), JSON.stringify(fields.text), function (post) {
            view.getPostDisplay(response, post);
        })
    });
}

exports.upvotePost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        post.getPost(fields.id, function (foundPost) {
            foundPost.upvote(function () {
                view.getPostDisplay(response, foundPost);
            })
        })
    })
}

exports.showPost = function (response, request) {
    var id = querystring.parse(url.parse(request.url).query)["id"];
    post.getPost(id, function (foundPost) {
        view.getPostDisplay(response, foundPost);
    })
}

exports.showMainPage = function (response, request) {
    var index = 0;
    var postList = "";
    post.getSortedPosts(function (postId, numberOfPosts) {
        // still not displaying these in the right order
        post.getPost(postId, function (post) {
            postList += view.mainPagePostLine(post);
            index++;
            if (numberOfPosts === index) {
                view.mainPage(response, postList);
            }
        })
    })
}


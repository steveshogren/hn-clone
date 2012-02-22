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
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.lrange("sortedPosts", 0, 34, function (err, postIds) {
            if (err) {
                response.writeHead(500, {"Content-Type":"text/html"});
                response.write(err);
                response.end();
                return;
            }
            var numberOfPosts = postIds.length;
            var count = 0;
            var postList = "";
            postIds.forEach(function (postId, i) {
                // not displaying these in the right order
                post.getPost(postId, function (post) {
                    postList += '<form action="/upvotePost" method="post">' +
                        '<a href="' + post.link + '">' + post.title + '</a>' +
                        '<input type="hidden" name="id" value="' + post.id + '">' +
                        '  <a href="/showPost?id='+post.id+'">Comments</a> Vote id: ' + post.id + ' Votes: ' + post.votes +
                        '</form>';
                    count++;
                    if (numberOfPosts === count) {
                        view.mainPage(response, postList);
                    }
                })
            })
        })
    });
}


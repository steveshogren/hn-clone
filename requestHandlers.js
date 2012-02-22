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
    var posts = new Array();
    post.getSortedPosts(function (post, numberOfPosts) {
        // still not displaying these in the right order
        posts.push(post);
        index++;
        if (numberOfPosts === index) {
            posts.sort(postSorter).forEach(function (post) {
                postList += view.mainPagePostLine(post);
            });
            view.mainPage(response, postList);
        }
    })
}
function postSorter(a, b) {
    if (a.score === b.score) {
        if (a.votes === b.votes) {
            // top three "javascript int to string" results...?
            if (a.id === b.id) {
                return 0;
            } else if (a.id > b.id) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.votes > b.votes) {
            return -1;
        } else {
            return 1;
        }
    } else if (a.score > b.score) {
        return -1;
    } else {
        return 1;
    }
}


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
                view.redirectToPost(response, post.id);
        })
    });
}

exports.upvotePost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        post.getPost(fields.id, function (foundPost) {
            foundPost.upvote(function () {
                view.redirectToPost(response, foundPost.id);
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
    post.numberOfPosts(function(number) {
        if (number == 0) {
            view.mainPage(response, 'No posts cached, create some posts and then run: "python runSort.py" to cache them');
            return;
        }
    });
    post.getSortedPosts(function (post, numberOfPosts) {
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


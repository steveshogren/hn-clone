var querystring = require("querystring"),
    url = require("url"),
    formidable = require("formidable"),
    redis = require("redis"),
    post = require("./post");

exports.createNewPostPage = function (response) {
    console.log("Request handler 'start' was called.");

    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        'Create new Posting: <br />' +
        '<form action="/createPost" method="post">' +
        'Title: <input type="text" name="title" /><br />' +
        'Link: <input type="text" name="link" /><br />' +
        'Text: <input type="text" name="text" /><br />' +
        '<input type="submit" value="Submit text" />' +
        '</form>' +
        '</body>' +
        '</html>';

    response.writeHead(200, {"Content-Type":"text/html"});
    response.write(body);
    response.end();
}

exports.createPost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        var client = redis.createClient();
        client.stream.on("connect", function () {
            client.incr('nextPost', function (err, id) {
                post.updatePost(id, JSON.stringify(fields.title), JSON.stringify(fields.link), JSON.stringify(fields.text), function () {
                    var message = 'The post has been saved at <a href="/showPost?id=' + id + '">' + request.headers.host + '/' + id + '</a>';
                    response.writeHead(200, {"Content-Type":"text/html"});
                    response.write(message);
                    response.end();
                })
            })
        });
    });
}

exports.upvotePost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        var client = redis.createClient();
        client.stream.on("connect", function () {
            client.incr('post:' + fields.id + ":votes", function (err, votes) {
                getPostDisplay(fields.id, function (body) {
                    response.writeHead(200, {"Content-Type":"text/html"});
                    response.write(body);
                    response.end();
                })
            })
        });
    });
}

function getPostDisplay(id, callback) {
    post.getPost(id, function (foundPost) {
        if (id === 0) {
            callback("post not found");
        }
        var hiddenPostField = '<input type="hidden" name="id" value="' + id + '">';
        var body = '<html>' +
            '<head>' +
            '<meta http-equiv="Content-Type" content="text/html; ' +
            'charset=UTF-8" />' +
            '</head>' +
            '<body>' +
            '<form action="/upvotePost" method="post">' +
            hiddenPostField +
            '<input type="submit" value="Upvote" /> Vote id: ' + id + '<br /> Votes: ' + foundPost.votes +
            '</form>' +
            'Title: <input type="text" name="title" value="' + foundPost.title + '" /><br />' +
            'Link: <input type="text" name="link" value="' + foundPost.link + '" /><br />' +
            'Text: <input type="text" name="text" value="' + foundPost.text + '" /><br />' +
            hiddenPostField +
            'Submitted: ' + foundPost.dateSubmitted.toString() +
            '</body>' +
            '</html>';
        callback(body);
    });
}

exports.showPost = function (response, request) {
    var id = querystring.parse(url.parse(request.url).query)["id"];
    getPostDisplay(id, function (body) {
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write(body);
        response.end();
    })
}

exports.showMainPage = function (response, request) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.lrange("sortedPosts", 0, 34, function (err, postIds) {
            if (err) {
                response.writeHead(404, {"Content-Type":"text/html"});
                response.write("Something is wrong");
                response.end();
                console.log(err);
                return;
            }
            var body = '<html>' + '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
                '</head>' + '<body>';
            var numberOfPosts = postIds.length;
            var count = 0;
            postIds.forEach(function (postId, i) {
                post.getPost(postId, function (post) {
                    count++;
                    body += '<a href="' + post.link + '">' + post.title + "</a><br />";
                    if (numberOfPosts == count) {
                        body += '</body></html>';
//                        console.log(body);
                        response.writeHead(200, {"Content-Type":"text/html"});
                        response.write(body);
                        response.end();
                    }
                })
            })
        })
    });
}


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
        '<form action="/uploadPost" method="post">' +
        '<textarea name="text" rows="20" cols="60"></textarea>' +
        '<input type="submit" value="Submit text" />' +
        '</form>' +
        '</body>' +
        '</html>';

    response.writeHead(200, {"Content-Type":"text/html"});
    response.write(body);
    response.end();
}

exports.uploadPost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        var client = redis.createClient();
        client.stream.on("connect", function () {
            client.incr('nextPost', function (err, id) {
                updatePostText(id, JSON.stringify(fields.text), function () {
                    var message = 'The post has been saved at <a href="/showPost?id=' + id + '">' + request.headers.host + '/' + id + '</a>';
                    response.writeHead(200, {"Content-Type":"text/html"});
                    response.write("received message:<br/>");
                    response.write(message);
                    response.end();
                })
            })
        });
    });
}

exports.updatePost = function (request, response) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        post.updatePostText(id, JSON.stringify(fields.text), function () {
            var message = 'The post has been saved at <a href="/showPost?id=' + id + '">' + request.headers.host + '/' + id + '</a>';
            response.writeHead(200, {"Content-Type":"text/html"});
            response.write(message);
            response.end();
        })
    });
}

exports.upvotePost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        var client = redis.createClient();
//        console.log("fields: " + fields.id);
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
            '<input type="submit" value="Upvote" /> Vote id: ' + id + ' Votes: ' + foundPost.votes +
            '</form>' +
//            '<form action="/updatePost" method="post">' +
            '<textarea name="text" rows="20" cols="60">' + foundPost.link + '</textarea>' +
            hiddenPostField +
//            '<input type="submit" value="Update text" />' +
//            '</form>' +
            'Submitted: ' + foundPost.dateSubmitted +
            'Title: ' + foundPost.title +
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


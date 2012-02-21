var querystring = require("querystring"),
    url = require("url"),
    formidable = require("formidable"),
    redis = require("redis");

exports.createNewPost = function (response) {
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
                client.set('post:' + id, JSON.stringify(fields.text), function () {
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

exports.upvotePost = function (response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        var client = redis.createClient();
        console.log("fields: " + fields.id);
        client.stream.on("connect", function () {
            client.incr('post:' + fields.id + ":votes", function (err, votes) {
                var body = '<html>' +
                    '<head>' +
                    '<meta http-equiv="Refresh" content="0;url=/showPost?id=' + fields.id + '" />' +
                    '</head>' +
                    '<body>' +
                    '</body>' +
                    '</html>';
                response.writeHead(200, {"Content-Type":"text/html"});
                response.write(body);
                response.end();
            })
        });
    });
}

function getPostDisplay(id, response) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.get('post:' + id, function (err, contents) {
            client.get('post:' + id + ':votes', function (err, votes) {
                console.log("id: " + id + " contents:" +contents + " votes: " + votes);
                if (!contents) {
                    response.writeHead(200, {"Content-Type":"text/html"});
                    response.write("post not found");
                    response.end();
                    return;
                }
//                if (! votes) { votes = JSON.stringify(1);}
                var body = '<html>' +
                    '<head>' +
                    '<meta http-equiv="Content-Type" content="text/html; ' +
                    'charset=UTF-8" />' +
                    '</head>' +
                    '<body>' +
                    '<form action="/upvotePost" method="post">' +
                    '<input type="hidden" name="id" value="' + id + '">' +
                    '<input type="submit" value="Upvote" /> Vote id: ' + id + ' Votes: ' + JSON.parse(votes.toString()) +
                    '</form>' +
//                '<form action="/updatPost" method="post">' +
                    '<textarea name="text" rows="20" cols="60">' + JSON.parse(contents.toString()) + '</textarea>' +
//                '<input type="submit" value="Submit text" />' +
//                '</form>' +
                    '</body>' +
                    '</html>';
                response.writeHead(200, {"Content-Type":"text/html"});
                response.write(body);
                response.end();
            })
        })
    });
}

exports.showPost = function (response, request) {
    var id = querystring.parse(url.parse(request.url).query)["id"];
    getPostDisplay(id, response)
}


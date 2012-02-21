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
        '<form action="/upload" method="post">' +
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

exports.showPost = function(response, request) {
    var id = querystring.parse(url.parse(request.url).query)["id"];
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.get('post:' + id, function (err, contents) {
            if (!contents) {
                response.writeHead(404);
                response.write("post not found");
                response.end();
                return;
            }
            response.writeHead(200, {"Content-Type":"text/html"});
            response.write("post:<br/>");
            response.write(JSON.parse(contents.toString()));
            response.end();
        })
    });
}


var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
    redis = require("redis");

function start(response) {
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

function upload(response, request) {
    console.log("Request handler 'upload' was called.");

    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function (error, fields, files) {
        console.log("parsing done", fields);

        var client = redis.createClient();
        client.stream.on("connect", function () {
            client.incr('nextPost', function (err, id) {
                client.set('post:' + id, JSON.stringify(fields.text), function () {
                    var message = 'The post has been saved at <a href="/' + id + '">' + request.headers.host + '/' + id + '</a>';
                    response.writeHead(200, {"Content-Type":"text/html"});
                    response.write("received message:<br/>");
                    response.write(message);
                    response.end();
                })
            })
        });
    });
}

function show(response) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.png", "binary", function (error, file) {
        if (error) {
            response.writeHead(500, {"Content-Type":"text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type":"image/png"});
            response.write(file, "binary");
            response.end();
        }
    });
}

exports.start = start;
exports.upload = upload;
exports.show = show;
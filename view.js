

exports.createNewPostPage = function (response) {
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
};

exports.mainPage = function(response, postList) {
    var body = '<html>' + '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
        '</head>' + '<body>' +
        postList +
        '</body></html>';
    response.writeHead(200, {"Content-Type":"text/html"});
    response.write(body);
    response.end();
}

exports.mainPagePostLine = function(post) {
    line = '<form action="/upvotePost" method="post">' +
        '<a href="' + post.link + '">' + post.title + '</a>' +
        '<input type="hidden" name="id" value="' + post.id + '">' +
        '  <a href="/showPost?id=' + post.id + '">Comments</a> Vote id: ' + post.id + ' Votes: ' + post.votes +
    '</form>';
    return line;
}
exports.getPostDisplay = function(response, post) {
    if (post.id === 0) {
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write("post not found");
        response.end();
    }
    var hiddenPostField = '<input type="hidden" name="id" value="' + post.id + '">';
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<form action="/upvotePost" method="post">' +
        hiddenPostField +
        '<input type="submit" value="Upvote" /> Vote id: ' + post.id + '<br /> Votes: ' + post.votes +
        '</form>' +
        'Title: <input type="text" name="title" value="' + post.title + '" /><br />' +
        'Link: <input type="text" name="link" value="' + post.link + '" /><br />' +
        'Text: <input type="text" name="text" value="' + post.text + '" /><br />' +
        hiddenPostField +
        'Submitted: ' + post.dateSubmitted.toString() +
        '<br />' +
        '<a href="/">Main Page</a>' +
        '</body>' +
        '</html>';
    response.writeHead(200, {"Content-Type":"text/html"});
    response.write(body);
    response.end();
}



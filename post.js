var redis = require("redis");

function nextPost() {
    return 'nextPost';
}
function postVotes(id) {
    return 'post:' + id + ':votes';
}
function postText(id) {
    return 'post:' + id;
}
function postTitle(id) {
    return 'post:' + id + ':title';
}
function postLink(id) {
    return 'post:' + id + ':link';
}
function postDate(id) {
    return 'post:' + id + ':date';
}
function allPosts() {
    return 'allPosts';
}

function Post(id, title, link, text, votes, dateSubmitted) {
    this.id = id;
    this.link = link;
    this.title = title;
    this.text = text;
    this.votes = votes;
    this.dateSubmitted = dateSubmitted;

    this.upvote = function (callback) {
        var id = this.id;
        var client = redis.createClient();
        client.stream.on("connect", function () {
            client.incr(postVotes(id), function (err, votes) {
                callback();
            })
        });
    }
}

exports.createPost = function (title, link, text, callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.incr(nextPost(), function (err, id) {
            updatePost(id, title, link, text, callback);
        })
    });
}

function updatePost(id, title, link, text, callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.set(postText(id), text, function () {
            client.set(postTitle(id), title, function () {
                client.set(postLink(id), link, function () {
                    var now = new Date();
                    client.set(postDate(id), now.getTime(), function () {
                        client.sadd(allPosts(), id, function () {
                            getPost(id, callback);
                        });
                    })
                })
            })
        })
    });
}

exports.getSortedPosts = function (callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.lrange("sortedPosts", 0, 34, function (err, postIds) {
            if (err) {
                response.writeHead(500, {"Content-Type":"text/html"});
                response.write(err);
                response.end();
                return;
            }
//            console.log(postIds);
            var numberOfPosts = postIds.length;
            for (var i = 0; i < numberOfPosts; i++) {
                callback(postIds[i], numberOfPosts);
            }
        })
    });
};
function getPost(id, callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.get(postText(id), function (err, text) {
            client.get(postVotes(id), function (err, votes) {
                client.get(postTitle(id), function (err, title) {
                    client.get(postLink(id), function (err, link) {
                        client.get(postDate(id), function (err, date) {
                            votes = parseInt(votes);
                            text = parseString(text);
                            title = parseString(title);
                            date = parseDate(date);
                            link = parseDate(link);
                            if (link === "") {
                                id = 0;
                            }
                            var post = new Post(id, title, link, text, votes, date);
                            callback(post);
                        })
                    })
                })
            })
        })
    });
}
function parseInt(value) {
    if (!value) {
        value = 0;
    } else {
        value = JSON.parse(value.toString());
    }
    return value
}
function parseDate(value) {
    if (!value) {
        value = new Date(0);
    } else {
        value = new Date(JSON.parse(value.toString()));
    }
    return value
}
function parseString(value) {
    if (!value) {
        value = "";
    } else {
        value = JSON.parse(value.toString());
    }
    return value
}
exports.updatePost = updatePost;
exports.getPost = getPost;


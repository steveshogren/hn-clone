var redis = require("redis");

function Post(id, link, title, votes, dateSubmitted) {
    this.id = id;
    this.link = link;
    this.title = title;
    this.votes = votes;
    this.dateSubmitted = dateSubmitted;
}
exports.updatePostText =  function(id, text, callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.set('post:' + id, text, callback);
    });
}

exports.getPost = function(id, callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.get('post:' + id, function (err, link) {
            client.get('post:' + id + ':votes', function (err, votes) {
                client.get('post:' + id + ':title', function (err, title) {
                    client.get('post:' + id + ':date', function (err, date) {
                        if (!votes) {
                            votes = 0;
                        } else {
                            votes = JSON.parse(votes.toString());
                        }
                        if (!title) {
                            title = "";
                        } else {
                            title = JSON.parse(title.toString());
                        }
                        if (!date) {
                            date = "";
                        } else {
                            date = JSON.parse(date.toString());
                        }
                        if (!link) {
                            link = "";
                            id = 0;
                        } else {
                            link = JSON.parse(link.toString());
                        }
                        var post = new Post(id, link, title, votes, date);
                        callback(post);
                    })
                })
            })
        })
    });
}


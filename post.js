var redis = require("redis");

function Post(id, title, link, text, votes, dateSubmitted) {
    this.id = id;
    this.link = link;
    this.title = title;
    this.text = text;
    this.votes = votes;
    this.dateSubmitted = dateSubmitted;
}

exports.updatePost = function(id, title, link, text, callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
            client.set('post:' + id, text, function () {
                    client.set('post:'+ id + ':title', title, function () { 
                            client.set('post:' + id + ':link', link, function () {
                                    var now = new Date();
                                    client.set('post:' + id + ':date', now.getTime(), function () {
                                            client.sadd('allPosts', id, callback);
                                        })
                                })
                        })
                })
    });
}

exports.getPost = function(id, callback) {
    var client = redis.createClient();
    client.stream.on("connect", function () {
        client.get('post:' + id, function (err, text) {
            client.get('post:' + id + ':votes', function (err, votes) {
                client.get('post:' + id + ':title', function (err, title) {
                    client.get('post:' + id + ':link', function (err, link) {
                        client.get('post:' + id + ':date', function (err, date) {
                                if (!votes) {
                                    votes = 0;
                                } else {
                                    votes = JSON.parse(votes.toString());
                                }
                                if (! text) {
                                    text = "";
                                } else {
                                    text = JSON.parse(text.toString());
                                }
                                if (!title) {
                                    title = "";
                                } else {
                                    title = JSON.parse(title.toString());
                                }
                                if (!date) {
                                    date = new Date(0);
                                } else {
                                    date = new Date(JSON.parse(date.toString()));
                                }
                                if (!link) {
                                    link = "";
                                    id = 0;
                                } else {
                                    link = JSON.parse(link.toString());
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


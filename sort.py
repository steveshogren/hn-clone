import redis
from datetime import datetime
from datetime import timedelta

def postDate(id):
    return 'post:' + str(id) + ':date'


def postVotes(id):
    return 'post:' + str(id) + ':votes'


def postTitle(id):
    return 'post:' + str(id) + ':title'


def postLink(id):
    return 'post:' + str(id) + ':link'


def postScore(id):
    return 'post:' + str(id) + ':score'


def postsWithScore(score):
    return 'score:' + str(score)


def highestscore():
    return 'highestScore'


def allPosts():
    return 'allPosts'


def sortedPosts():
    return 'sortedPosts'


def getPostAgeInMinutes(r, id, currentdate):
    date = r.get(postDate(id))
    if not date:
        date = '0'
    date = datetime.fromtimestamp(int(date) / 1000)
    diff = currentdate - date
    minutesOld = diff.seconds / 60
    return minutesOld


def calculateScore(votes, minutesOld):
    """
    Calculates the "score" of a post from the minutes old and the number of upvotes
    >>> calculateScore(6, 20)
    20
    >>> calculateScore(18, 20)
    55
    """
    score = (votes + 1) / pow(((minutesOld / 60) + 2), 1.8)
    score = int(round(score * 10))
    return score


def updateHighestScore(r, score):
    highestScore = r.get(highestscore())
    if not highestScore:
        highestScore = '0'
    if int(highestScore) < score:
        r.set(highestscore(), str(score))


def updateScoreToIdRelationship(r, id, score):
    oldScore = r.get(postScore(id))
    if oldScore and int(oldScore) != score:
        r.smove(postsWithScore(oldScore), postsWithScore(score), id)
    else:
        r.sadd(postsWithScore(score), id)

    #update the id -> score relationship (for future removal from sorted hashmap)
    r.set(postScore(id), score)


def sortAllPosts():
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    for id in r.smembers(allPosts()):
        votes = r.get(postVotes(id))
        if not votes:
            votes = 0
        else:
            votes = int(votes)

        minutesOld = getPostAgeInMinutes(r, id, datetime.now())
        score = calculateScore(votes, minutesOld)
        #        print 'id: ' + id + '  votes: ' + str(votes) + '  min: ' + str(minutesOld) + '  score: ' + str(score)

        updateHighestScore(r, score)
        updateScoreToIdRelationship(r, id, score)


def buildTopPostLists():
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    highscore = r.get(highestscore())
    if not highscore:
        highscore = '0'
    r.ltrim(sortedPosts(), 1, 0)
    for x in range(int(highscore), 0, -1):
        for id in r.smembers(postsWithScore(x)):
            if id:
                r.rpush(sortedPosts(), id)

#    print 'sorted: ' + str(r.lrange(sortedPosts(), 0, -1))

if __name__ == "__main__":
    import doctest

    doctest.testmod()
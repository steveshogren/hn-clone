import redis
from datetime import datetime
from datetime import timedelta

currentdate = datetime.now()
print 'current date: ' + currentdate.isoformat()
r = redis.StrictRedis(host='localhost', port=6379, db=0)
for id in r.smembers('allPosts'):
    votes = r.get('post:'+id+':votes')
    date = r.get('post:'+id+':date')
    if not votes: 
        votes = '0'
    if not date:
        date = '0'
    print ' date from redis: ' + date
    date = datetime.fromtimestamp(int(date)/1000)
    diff = currentdate - date
    minutesOld = str(diff.seconds/60) 
    score = (votes-1)/(minutesOld+2)^1.8
    print 'id: ' + id + ' votes: ' + votes + ' date: ' + date.isoformat() + '   minutes since last used: ' + minutesOld + ' score: ' + score
    
    

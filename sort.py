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
    minutesOld = diff.seconds/60 
    score = (int(votes)+1)/pow(((minutesOld/60)+2), 1.8) 
    print 'id: ' + id + ' votes: ' + votes + ' date: ' + date.isoformat() + '   hours since last used: ' + str(minutesOld/60) + ' score: ' + str(score)
    
    

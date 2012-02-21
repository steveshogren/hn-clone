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
    score = int(round(score*10))
    print 'id: ' + id + '  votes: ' + votes + '  date: ' + date.isoformat() + '  hours: ' + str(minutesOld/60) + '  score: ' + str(score)
    
    #update the highest score
    highestScore = r.get('highestscore')
    if not highestScore:
        highestScore = '0'
    if int(highestScore) < score:
        r.set('highestscore', score)
    
    #update the score -> id relationship (for sorting)
    oldScore = r.get('post:'+id+':score')
    if oldScore and int(oldScore) != score:
        r.smove('score:'+int(oldScore), 'score:'+score, id)
    else:
        r.sadd('score:'+score, id)
        
#update the id -> score relationship (for future removal from sorted hashmap)
    r.set('post:'+id+':score', score)
   
    

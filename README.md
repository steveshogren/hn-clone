# hn-clone

A rough pass at making a redis-backed Hacker News clone.

I used node.js for serving requests and a python script 
to be run periodically to score and rank posts.

## Installing Dependencies: 
    $ npm install formidable
(https://github.com/mranney/node_redis)
    
    $ npm install redis 
(redis for python https://github.com/andymccurdy/redis-py)
    
    $ sudo pip install redis 

## To use:
    $ node index.js
* Browse to localhost:8888 
* Create a few posts, and upvote them
* Sort and cache posts
    $ python runSort.py

## Caveats
There is no validation of form values, so it is possible to 
inject malicious (or in the case of the links) broken values. 
The point of this was not to demonstrate web security and 
validation techniques, but to demonstrate an ability to use 
node.js and redis to build a working site.


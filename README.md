# hn-clone

A rough pass at making a redis-backed Hacker News clone.

I used node.js for serving requests and a python script 
to be run periodically to score and rank posts. I did
not think that node was good tool for running to calculate
and cache the score of the posts, because that could cause
blocking of requests. As it is, the node site expects the 
cached values to be there, and leaves it to the administrator
so see that the python script is timed and run at valuable
intervals.

## Installing Dependencies: 
    $ npm install formidable
Install node_redis https://github.com/mranney/node_redis

    $ npm install redis 
Install redis for python https://github.com/andymccurdy/redis-py

    $ sudo pip install redis 

## To use:
    $ node index.js
* Browse to localhost:8888 
* Create a few posts, and upvote them
* Sort and cache posts with python script


    $ python runSort.py 

## Caveats
There is no validation of form values, so it is possible to 
inject malicious (or in the case of the links) broken values. 
The point of this was not to demonstrate web security and 
validation techniques, but to demonstrate an ability to use 
node.js and redis to build a working site.

Additionally, the lack of any sort of any nice ui and poor
techniques like html redirects were used in the interest of
time.


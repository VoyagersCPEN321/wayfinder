# wayfinder

To get things running clone this repo and run "npm install" inside the root directory for the repo.

Follow these 2 tutorials if the code and setup are not clear enough:
https://blog.sourcerer.io/a-crash-course-on-typescript-with-node-js-2c376285afe1
https://brianflove.com/2016/03/29/typescript-express-node-js/

To run the current hello world server:
in the root dir run: "npm start"

To compile:
run "npm grunt watch" for files to be autocompiled and get style checked as you edit them.
run "npm grunt" to run grunt which compile and check code style only once.


For MongoDB:
Install mongoDB from their website and follow instructions until you are able to call 'mongod'
in the terminal/cmd line interface. Then make sure the directory wayfinder/data/db exists and you should be good to go.
to start the db run 'mongod --dbpath data/db/' in the wayfinder root directory.


NOTE:
The output js files are ignored so you need to compile after each git pull to prevent any weird business
from happening if you are testing after a merge or a normal pull.



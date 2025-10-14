Guide to use Cuvette Api Logger
Step 1: npm i cuvette-api-tracer
Step 2: import logger from 'cuvette-api-tracer' in index.js file
Step 3 : app.use(logger())
Step 4 : Attach api-key in req headers x-api-key attribute
Note: We follow 24 hours time format and Always check configuration tab if data is not found
Note: We are using free instance of Render which will spin down with inactivity, which can delay requests by 50 seconds or more.
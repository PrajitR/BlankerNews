# Blanker News

Easily customize a ready made Hacker News skeleton for any community you want.

## Setup

This uses Node.js and MongoDB. You need to install both. Then:

    npm install

for dependencies. Then start running a MongoDB instance. The database will be `users` (though you can change it in `index.js`. To run:

    node index.js

For tests, either of these work:
 
    npm test
    make test

## Status

I'm planning in the near future to rewrite this with Backbone.js and refactor. Hopefully the code will be more reusable and modular after the rewrite. 

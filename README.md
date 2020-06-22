# Express Boilerplate
this is a boilerplate project used for starting new projects.
## Setup
complete the following to start a new project:
1. clone repo to local: `git clone URL PROJECT-NAME`
2. cd into cloned repo
3. git fresh start: `rm -rf .git && git init`
4. install dependencies: `npm install`
5. move example.env to the .env that will be ignored by git `mv example.env .env`
6. edit package.json to use the new project name @ "name": "express-boilerplate"
## Scripts
start the app: `npm start`
start nodemon: `npm run dev`
run tests: `npm test`
## Deploying
1. `heroku create`
2. `npm run deploy` (repeat prn as project is updated)
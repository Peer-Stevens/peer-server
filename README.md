[![CI Lint](https://github.com/Peer-Stevens/peer-server/actions/workflows/lint.yml/badge.svg)](https://github.com/Peer-Stevens/peer-server/actions/workflows/lint.yml)
[![CI Unit Tests](https://github.com/Peer-Stevens/peer-server/actions/workflows/unit-test.yml/badge.svg)](https://github.com/Peer-Stevens/peer-server/actions/workflows/unit-test.yml)
[![CodeQL](https://github.com/Peer-Stevens/peer-server/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Peer-Stevens/peer-server/actions/workflows/codeql-analysis.yml)
[![codecov](https://codecov.io/gh/Peer-Stevens/peer-server/branch/main/graph/badge.svg?token=HQWZN0SNVS)](https://codecov.io/gh/Peer-Stevens/peer-server)

# Peer-server

Node server for Peer

## Prerequisite

### Environment Variables Needed

DB_USERNAME - your MongoDB username  
DB_PASSWORD - your password for the connected MongoDB database  
DB_NAME - the name of the MongoDB database you are using to run Peer  
DB_ENV - the environment that MongoDB will connect to (local or atlas)  
PLACES_API_KEY - the Google Places API key

### Detailed Prerequisite

**Make sure to follow these instructions before trying to interact with the application since you won't be able to access any data until you do!**

Please make sure you have the latest version of `main` before proceeding since there are some important dependancies you'll need in order to get this to work!

In order to be able to connect to the mongo cluster, you need to create a `.env` file at the root of the peer-server directory with the following variables:

```
DB_USERNAME=yourUsername
DB_PASSWORD=yourPassword
DB_NAME=yourName-dev
DB_ENV=atlas
```

Once you do this, now you need to create a database user in mongo atlas in order for you to be able to connect to it. Create a user by following this link [here](https://cloud.mongodb.com/v2/61415c0a5421134c56195254#security/database/users).
Make sure to click on `Add new database user` to do this. Please **DO NOT** forget your username and password, this is how you will connect to the cloud, so its **VITAL** that you don't lose these credentials.

Once you created a database user, please go back to your `.env` file and add your username and password. It should look something like this:

```
DB_USERNAME=yourUsername
DB_PASSWORD=yourPassword
```

Also make sure to add a `DB_NAME`. The DB we will be connecting to while we develop the application will be called `yourName-dev`, where `yourName` is literally your name (ie `eleni-dev`, `david-dev`, etc.) so please write that in there as well. It should look like this:

```
DB_NAME=yourName-dev
```

When we decide to create a production environment when we're ready to test, the `DB_NAME` will be `production`. We don't need to worry about this for now, though.

Next, you want to add a network user. Please do that by following this link [here](https://cloud.mongodb.com/v2/61415c0a5421134c56195254#security/network/accessList).
This will help mongo identify who you are when you try to access the database. I clicked on the option that said "Allow access from anywhere" because it got really annoying to add an IP for every location I could be working in (which was literally so many different places).

After you've done all the required steps above, you can now test the connection! Run `yarn seed` to wipe the your database and load it in with new data. Feel free to play around with this file to test, if you'd like.

_Another note:_ The db functions I've written are obviously only relevant right now for testing purposes; this will change once we start building up the backend architecture!

## Scripts

> yarn build

Compiles all the typescript files down to javascript. Typescript is supposed to compile down to javascript, and the application is supposed to take those js files and run them. Run this command if you've made changes to any ts files and need to recompile the project so `dist` has the latest changes. (The compiled ts files will be in a folder called `dist` and it will automatically be created for you if you're running this command for the first time.)

> yarn watch

This is the command you will most likely use the most! Run this when you are actively working on code while testing. Every time you save a file, it will be detected by [nodemon](https://www.npmjs.com/package/nodemon) and will restart the server for you so you don't have to.

> yarn dev

This is a script that should only be used in development. This is the same thing as `yarn run watch` except that it **will not** restart the server for you. This command is useful when you are testing and don't need the automatic restart functionality.

> yarn start

This command should only be used in production (but you can definitely still use it during development to make sure that things are working as intended). This command will run the project from the `dist` folder, which holds the compiled ts files (which are all in js).

> yarn prod

This command should only be used in production. It will run `yarn run build` and `yarn run start` (but you can definitely still use it during development to make sure that things are working as intended).

> yarn lint

Run this command to format your code to maintain a uniform code style among the team! This will automatically be run in the pre-commit stage, but you can also run it yourself for kicks n giggles.

> yarn seed

This command should be used to load the database with fake data for testing. It will wipe the database clean before inserting items. Watch your terminal/command prompt to see if it was successful.

# Peer-server

Node server for Peer

## Scripts

> yarn run build

Compiles all the typescript files down to javascript. Typescript is supposed to compile down to javascript, and the application is supposed to take those js files and run them. Run this command if you've made changes to any ts files and need to recompile the project so `dist` has the latest changes. (The compiled ts files will be in a folder called `dist` and it will automatically be created for you if you're running this command for the first time.)

> yarn run watch

This is the command you will most likely use the most! Run this when you are actively working on code while testing. Every time you save a file, it will be detected by [nodemon](https://www.npmjs.com/package/nodemon) and will restart the server for you so you don't have to.

> yarn run dev

This is a script that should only be used in development. This is the same thing as `yarn run watch` except that it **will not** restart the server for you. This command is useful when you are testing and don't need the automatic restart functionality.

> yarn run start

This command should only be used in production (but you can definitely still use it during development to make sure that things are working as intended). This command will run the project from the `dist` folder, which holds the compiled ts files (which are all in js).

> yarn run prod

This command should only be used in production. It will run `yarn run build` and `yarn run start` (but you can definitely still use it during development to make sure that things are working as intended).

> yarn run lint

Run this command to format your code to maintain a uniform code style among the team! This will automatically be run in the pre-commit stage, but you can also run it yourself for kicks n giggles.

> yarn run seed

This command should be used to load the database with fake data for testing. It will wipe the database clean before inserting items. Watch your terminal/command prompt to see if it was successful.

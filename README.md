# misas-server

[![Greenkeeper badge](https://badges.greenkeeper.io/misas-io/misas-server.svg)](https://greenkeeper.io/)

# Setup

## Configuration

misas.toml

## DB Setup

All of the following commands use misas.toml configuration to connect to the DB. By default when developing on your computer, we recommend that you setup a mongo container on which to have the server connect.

```bash
docker run -d --name mongodb -p 27017:27017 mongo:3.4
```

### Install MongoDB migrations

Migrations should be run everytime before starting the server. The following command will run all the migration that have yet to be run until the last migration is complete.

```
# to load 
npm run migrate up
```

### Load the GRPs

```bash
# to load a json file containing parroquias into meteor
npm run load_grps -- --file ./misas/parroquias.json
```

## Run Server

The following command will start the misas-server

```bash
npm run dev:server 
```

## Test Server

Note: at the moment you might have to first have a connection to mongodb server before running the test. This is due to some design issues which will be addressed in the future. To run the test use the following command.

```bash
npm run test
```

This command will test any mocha file ending with `*.test.js` in the `api/` directory. Checkout `api/mongo/grp/model.test.js` for an example.

To see the graphql schema connect to http://host:port/graphiql/

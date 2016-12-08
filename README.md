# misas-server

# Setup

## Configuration

misas.toml

## DB Setup

All of the following commands use misas.toml configuration to connect to the DB

### Install MongoDB migrations

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
npm run start
```

## Test Server

Note: at the moment you might have to first have a connection to mongodb server before running the test. This is due to some design issues which will be addressed in the future. To run the test use the following command.

```bash
npm run test
```

This command will test any mocha file ending with `*.test.js` in the `api/` directory. Checkout `api/mongo/grp/model.test.js` for an example.

To see the graphql schema connect to http://host:port/graphiql/

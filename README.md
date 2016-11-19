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

To see the graphql schema connect to http://<host>:<port>/graphiql/

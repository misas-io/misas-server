import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { addErrorLoggingToSchema } from 'graphql-tools';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { printSchema } from 'graphql/utilities/schemaPrinter';
import { subscriptionManager } from './api/subscriptions';
import bodyParser from 'body-parser';
import cors from 'cors';
import settings from './settings';
import log from './log';
import schema from './api/schema';

//check settings before initialization
const server = settings.server;
const logger = { log: (e) => log.error('GraphQL schema error', e.stack) };
const graphQLServer = express().use('*', cors());

// setup graph ql server
graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {},
}));

addErrorLoggingToSchema(schema, logger);

graphQLServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

graphQLServer.use('/schema', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(printSchema(schema));
});

graphQLServer.get('/health', (req, res) => {
  res.send('healthy');
});

graphQLServer.listen(server.port, () => log.info(
  `GraphQL Server is now running on http://${server.host}:${server.port}/graphql`
));

// WebSocket server for subscriptions
const websocketServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

websocketServer.listen(server.subscription_port, () => log.info( // eslint-disable-line no-console
  `Websocket Server is now running on http://${server.host}:${server.subscription_port}`
));

// eslint-disable-next-line
new SubscriptionServer(
  { subscriptionManager },
  websocketServer
);

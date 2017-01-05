import { PubSub, SubscriptionManager } from 'graphql-subscriptions';
import schema from '@/lib/api/schema';

const pubsub = new PubSub();
const subscriptionManager = new SubscriptionManager({
  schema,
  pubsub,
});

export { subscriptionManager, pubsub };

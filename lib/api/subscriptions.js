import { PubSub, SubscriptionManager } from 'graphql-subscriptions';
import schema from '@/lib/schema';

const pubsub = new PubSub();
const subscriptionManager = new SubscriptionManager({
  schema,
  pubsub,
});

export { subscriptionManager, pubsub };

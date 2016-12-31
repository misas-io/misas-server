import { MongoURL } from '@/lib/settings';

module.exports = { 
  development: {
    schema: { 'migration': {} },
    modelName: 'Migration',
    db: MongoURL,
  }
};

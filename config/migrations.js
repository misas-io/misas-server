import { MongoURL } from '@/settings';

module.exports = { 
  development: {
    schema: { 'migration': {} },
    modelName: 'Migration',
    db: MongoURL,
  }
};

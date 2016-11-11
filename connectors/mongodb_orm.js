import log from '@/log';
import mongoose from 'mongoose';
import { MongoURL } from '@/settings';
import bluebird from 'bluebird'

mongoose.Promise = bluebird;
mongoose.connect(MongoURL);

export { mongoose };

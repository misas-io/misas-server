import log from './../../log';
import mongoose from 'mongoose';
import { MongoURL } from './../../settings';

mongoose.connect(MongoURL);

export { mongoose };

import { isString } from 'lodash';
import log from '@/lib/log';
import assert from 'assert';

export function toGlobalId(type, localId){
  assert.notEqual(null, type);
  assert.notEqual(null, localId);
  let buffer = new Buffer(JSON.stringify({
    type: type,
    localId: localId
  }));
  return (buffer.toString('base64'));
};

export function fromGlobalId(globalId){
  let string = new Buffer(globalId, 'base64').toString('ascii');
  try {
    globalId = JSON.parse(string);
  } catch(err) {
    throw new Error('id formatted incorrectly');
  }
  let { type, localId } = globalId;
  if(!isString(type) || !isString(localId)){
    throw new Error('id formatted incorrectly');
  }
  return globalId;
};


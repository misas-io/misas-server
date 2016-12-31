import { isString, toString, toInteger } from 'lodash';
import log from '@/lib/log';
import assert from 'assert';

export function toBase64(obj){
  assert.notEqual(null, obj);
  let buffer = new Buffer(JSON.stringify(obj));
  return (buffer.toString('base64'));
};

export function fromBase64(str){
  let string = new Buffer(str, 'base64').toString('ascii');
  try {
    obj = JSON.parse(string);
  } catch(err) {
    log.error("JSON string is formatted incorrectly");
  }
  return obj;
};

export function intToBase64(intValue){
  assert.notEqual(null, intValue);
  let buffer = new Buffer(toString(intValue));
  return (buffer.toString('base64'));
};

export function intFromBase64(str){
  let string = new Buffer(str, 'base64').toString('ascii');
  return toInteger(string);
};

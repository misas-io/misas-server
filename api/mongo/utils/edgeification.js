import { map, isArray } from 'lodash';
import { intToBase64 } from '@/misc/base_64';

export function edgeify(index, results, first){
  if(isArray(results)){
    let hasNext = results.length > first;
    return {
      edges: map(results, (result) => {
        return {
          cursor: intToBase64(index++),
          node: result,
        };
      }),
      pageInfo: {
        hasNextPage: hasNext,
      },
    };
  }
};

import { toGlobalId, fromGlobalId } from '@/misc/global_id';

export const EventQueryResolvers = {
  event(_, {id}){
    let { type, localId } = fromGlobalId(id);
    //return Grp.findById(localId).exec();
    return {};
  },
  //searchGrps(_, {name, polygon, sortBy, first, after}){
  //};
};

export const EventMutationResolvers = {
  addGrpEvents(_, { id, events }) {
    //add the new grp to mongodb
    return [];
  },
  removeGrpEvents(_, { id, events }){
    return [];
  }
};


export const EventResolvers = {
  Event: {
    recurrences(){
      return []
    },
  },
  Recurrence: {
  },
};

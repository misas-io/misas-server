import { toGlobalId } from '@/misc/global_id';
import { mongoose } from '@/connectors/mongodb_orm';

const Schema = mongoose.Schema;

const grpSchema = new Schema({
  type: { 
    name: String,
    religion: Schema.Types.ObjectId 
  },
  name:  String,
  description: String,
  location: {
    address: {
      address_line_1: String,
      address_line_2: { type: String, default: "" },
      address_line_3: String,
      country: String,
      city: String,
      state: String,
      postal_code: Number,
    },
    lat: Number,
    lon: Number,
  },
  schedules: [ 
    {
      type: String,
      value: String,
      active: Boolean
    }
  ],
  contributors: [Schema.Types.ObjectId],
  created: { 
    type: Date, default: Date.now 
  },
  updated: { 
    type: Date, default: Date.now 
  }
}); 

const Grp = mongoose.model('grp', grpSchema);

export { Grp }

import { mongoose } from '@/connectors/mongodb_orm';
const Schema = mongoose.Schema;

const grpSchema = new Schema({
  type: String,
  name:  String,
  location: {
    address: {
      address_line_1: String,
      address_line_2: String,
      address_line_3: String,
      country: String,
      city: String,
      state: String,
      postal_code: Number
    },
    lat: Number,
    lon: Number
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

import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { getUserId } from '../utils';

export const CountSchema = new Schema({
  invites: { type: Number },
  messages: { type: Number },
});

export const Count = mongoose.model('Count', CountSchema);
export const CountTC = composeWithMongoose(Count);

CountTC.addResolver({
  name: 'counts',
  args: {},
  type: CountTC,
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const invites = 2;
    const messages = 2;
    return { invites, messages };
  },
});

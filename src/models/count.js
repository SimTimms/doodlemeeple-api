import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { getUserId } from '../utils';
import { Message } from '../models';

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
    const messages = await Message.find({ receiver: userId, status: 'unread' });
    return { invites, messages: messages.length };
  },
});

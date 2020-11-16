import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { getUserId } from '../utils';
import { Message, Invite, Contract, Job } from '../models';

export const CountSchema = new Schema({
  invites: { type: Number },
  messages: { type: Number },
  quotes: { type: Number },
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
    const invites = await Invite.find({
      $and: [{ receiver: userId }, { sender: { $ne: userId } }],
      status: 'unopened',
    });

    const messages = await Message.find({ receiver: userId, status: 'unread' });

    const jobs = await Job.find(
      {
        user: userId,
        submitted: 'submitted',
        contracts: { $exists: true, $ne: [] },
      },
      { contracts: 1 }
    );
    let jobTotal = 0;
    for (let i = 0; i < jobs.length; i++) {
      jobTotal += jobs[i].contracts.length;
    }

    return {
      invites: invites.length,
      messages: messages.length,
      quotes: jobTotal,
    };
  },
});

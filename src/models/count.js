import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { getUserId } from '../utils';
import { Message, Invite, Job, User, Contract } from '../models';

export const CountSchema = new Schema({
  invites: { type: Number },
  messages: { type: Number },
  quotes: { type: Number },
  jobs: { type: Number },
  socials: { type: Number },
  contact: { type: Number },
  skills: { type: Number },
  draftQuotes: { type: Number },
  totalDeclined: { type: Number },
  draftJobs: { type: Number },
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
    const user = await User.findOne({
      _id: userId,
    });

    const social =
      user.facebook || user.twitter || user.linked || user.instagram ? 1 : 0;
    const contact = user.skype || user.publicEmail || user.website ? 1 : 0;
    const skills = user.sections.length;

    const invites = await Invite.find({
      $and: [{ receiver: userId }, { sender: { $ne: userId } }],
      $or: [{ status: 'unopened' }, { status: 'read' }],
    });

    const messages = await Message.find({ receiver: userId, status: 'unread' });

    const activeJobs = await Job.find({
      user: userId,
      $and: [{ submitted: { $ne: 'draft' } }, { submitted: { $ne: 'closed' } }],
    });

    const draftJobs = await Job.find({
      user: userId,
      submitted: 'draft',
    });

    const totalDeclined = await Job.find({
      user: userId,
      $and: [{ submitted: 'totalDecline' }],
    });

    const jobs = await Job.find(
      {
        user: userId,
        submitted: 'submitted',
        contracts: { $exists: true, $ne: [] },
      },
      { contracts: 1 }
    );

    const draftQuotes = await Contract.find({
      user: userId,
      status: 'draft',
    });

    let jobTotal = 0;
    for (let i = 0; i < jobs.length; i++) {
      jobTotal += jobs[i].contracts.length;
    }

    return {
      invites: invites.length,
      messages: messages.length,
      quotes: jobTotal,
      jobs: activeJobs.length,
      socials: social,
      contact,
      skills: skills,
      draftQuotes: draftQuotes.length,
      totalDeclined: totalDeclined.length,
      draftJobs: draftJobs.length,
    };
  },
});

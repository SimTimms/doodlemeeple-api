import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, GameTC, InviteTC, Notification } from './';
import { getUserId } from '../utils';
const { INVITED } = require('../utils/notifications');

export const JobSchema = new Schema(
  {
    name: { type: String },
    keywords: [{ type: String }],
    img: { type: String },
    backgroundImg: { type: String },
    summary: { type: String },
    location: { type: String },
    showreel: { type: String },
    creativeSummary: { type: String },
    submitted: { type: String },
    invites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Invite',
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
    },
    type: { type: String },
  },
  {
    collection: 'jobs',
  }
);

JobSchema.plugin(timestamps);
JobSchema.index({ createdAt: 1, updatedAt: 1 });

export const Job = mongoose.model('Job', JobSchema);
export const JobTC = composeWithMongoose(Job);

JobTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});

JobTC.addRelation('game', {
  resolver: () => {
    return GameTC.getResolver('findOne');
  },
  prepareArgs: {
    filter: (source) => ({ _id: source._id }),
  },
  projection: { id: true },
});

JobTC.addRelation('invites', {
  resolver: () => {
    return InviteTC.getResolver('findMany');
  },
  prepareArgs: {
    _id: { $in: (source) => source.invites },
  },
  projection: { id: true },
});

JobTC.addResolver({
  name: 'jobsByUser',
  type: [JobTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobs = await Job.find({ user: userId });
    return jobs;
  },
});

JobTC.addResolver({
  name: 'submitBrief',
  type: JobTC,
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async ({ source, args, context, info }) => {
    const userId = getUserId(context.headers.authorization);

    const jobId = args._id;

    const jobDeets = await JobTC.getResolver('findOne').resolve(args);
    const invitees = await UserTC.getResolver('findMany').resolve({
      invites: { $in: jobDeets.invites },
      projection: { email: true },
    });
    const emailAddresses = await invitees.map((user) => user.email);
    await Job.updateOne({ _id: jobId }, { submitted: true });

    const notifications = invitees.map(async (user) => {
      INVITED.message = `${jobDeets.name}`;
      INVITED.linkTo = `${INVITED.linkTo}`;
      await Notification.create({ ...INVITED, user: user._id });
    });

    Promise.all(notifications).then();
    /*
  emailAddresses  .map((email) => {
      const request = emailInvite(email, jobDeets);

      request
        .then((result) => {
          //  console.log(result);
        })
        .catch((err) => {
          console.log(err.statusCode);
        });
    });

  const conversationExists = await context.prisma.$exists.conversation({
    participants_some: { id_in: [userId] },
    job: { id: jobId },
  });

  if (!conversationExists) {
    const results2 = emailAddresses.map(async (user) => {
      await context.prisma.createConversation({
        participants: {
          connect: [{ id: user.id }, { id: userId }],
        },
        job: { connect: { id: jobId } },
      });
    });

    Promise.all(results2).then();
  }

  await context.prisma.updateManyInvites({
    data: {
      status: 'submitted',
    },
    where: {
      job: { id: jobId },
    },
  });

  return true;
*/
  },
});

import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import {
  UserTC,
  GameTC,
  InviteTC,
  Notification,
  Invite,
  User,
  ContractTC,
} from './';
import { getUserId } from '../utils';
import { INVITED } from '../utils/notifications';
import { emailInvite } from '../email';

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
    assignedCreative: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    contracts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
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
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.user,
  },
  projection: { id: true },
});

JobTC.addRelation('assignedCreative', {
  resolver: () => {
    return UserTC.getResolver('findOne');
  },
  prepareArgs: {
    filter: (parent) => ({ _id: { $in: parent.assignedCreative } }),
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
    filter: (parent) => ({ _id: { $in: parent.invites } }),
  },
  projection: { id: true },
});

JobTC.addRelation('contracts', {
  resolver: () => {
    return ContractTC.getResolver('findMany');
  },
  prepareArgs: {
    filter: (parent) => ({ _id: { $in: parent.contracts } }),
  },
  projection: { id: true },
});

JobTC.addResolver({
  name: 'jobsByUser',
  type: [JobTC],
  args: { status: 'String' },
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobs =
      rp.args.status != ''
        ? await Job.find({ user: userId, submitted: rp.args.status }).sort({
            updatedAt: -1,
          })
        : await Job.find({ user: userId }).sort({ updatedAt: -1 });
    console.log(rp.args);
    return jobs;
  },
});

JobTC.addResolver({
  name: 'closeJob',
  type: JobTC,
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const job = await Job.updateOne(
      { _id: rp.args._id, user: userId },
      { submitted: 'closed' }
    );
    await Invite.updateMany(
      { job: rp.args._id, status: { $ne: 'declined' } },
      { status: 'closed' }
    );
    return null;
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

    const jobDeets = await Job.findOne({ _id: jobId });
    const invites = await Invite.find({ _id: { $in: jobDeets.invites } });
    const inviteIds = invites.map((invite) => invite.receiver);
    const invitees = await User.find({ _id: { $in: inviteIds } });
    await Job.updateOne({ _id: jobId }, { submitted: 'submitted' });

    const notifications = invitees.map(async (user) => {
      const notificationMessage = { ...INVITED };

      notificationMessage.message = `${jobDeets.name}`;
      notificationMessage.linkTo = `${notificationMessage.linkTo}`;
      await Notification.create({ ...notificationMessage, user: user._id });
    });

    Promise.all(notifications).then();

    invitees.map((user) => {
      const request = emailInvite(user, jobDeets);

      request
        .then((result) => {
          //  console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
    });
    /*
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

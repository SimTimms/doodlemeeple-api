import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, JobTC, Job, Notification, User, Message, Contract } from './';
import { getUserId } from '../utils';
import { DECLINED } from '../utils/notifications';
import { emailDeclineInvite } from '../email';
const ObjectId = mongoose.Types.ObjectId;

export const InviteSchema = new Schema(
  {
    title: { type: String },
    message: { type: String },
    status: { type: String },
    messages: { type: Number },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
  },
  {
    collection: 'invites',
  }
);

InviteSchema.plugin(timestamps);
InviteSchema.index({ createdAt: 1, updatedAt: 1 });

export const Invite = mongoose.model('Invite', InviteSchema);
export const InviteTC = composeWithMongoose(Invite);

InviteTC.addRelation('sender', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.sender,
  },
  projection: { id: true },
});

InviteTC.addResolver({
  name: 'inviteDetails',
  type: InviteTC,
  args: { jobId: 'MongoID!' },
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const invites = await Invite.findOne({
      $and: [{ receiver: userId }, { job: rp.args.jobId }],
    });
    return invites;
  },
});

InviteTC.addResolver({
  name: 'invitesByUser',
  type: [InviteTC],
  args: { status: ['String'] },
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const invites = await Invite.find({
      $and: [
        { receiver: userId },
        { sender: { $ne: userId } },
        { sender: { $ne: null } },
        { job: { $ne: null } },
        { status: { $in: rp.args.status } },
      ],
    });

    return invites;
  },
});

InviteTC.addResolver({
  name: 'inviteHistory',
  type: [InviteTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const invites = await Invite.find({
      receiver: userId,
      status: { $in: ['declined', 'closed'] },
    }).sort({
      updatedAt: -1,
    });

    return invites;
  },
});

InviteTC.addFields({
  messages: {
    type: 'Int',
    description: 'message count',
    resolve: async (source, args, context, info) => {
      const userId = getUserId(context.headers.authorization);

      const messages = await Message.find({
        job: source.job,
        receiver: userId,
        status: 'unread',
        sender: source.receiver,
      });
      return messages ? messages.length : 0;
    },
  },
});

InviteTC.addResolver({
  name: 'declineInviteByJob',
  args: { jobId: 'MongoID!' },
  type: InviteTC,
  kind: 'mutation',
  resolve: async ({ source, args, context }) => {
    const userId = getUserId(context.headers.authorization);

    async function allInvitesDeclined(invite) {
      const openInvites = await Invite.find({
        job: invite.job,
        status: { $ne: 'declined' },
      });
      return openInvites.length === 1 ? true : false;
    }

    const invite = await Invite.findOne({
      receiver: userId,
      job: args.jobId,
    });

    const allDeclined = await allInvitesDeclined(invite);
    allDeclined &&
      (await Job.updateOne({ _id: invite.job }, { submitted: 'totalDecline' }));

    await Contract.updateOne(
      { job: invite.job, user: invite.receiver._id },
      { status: 'declined' }
    );

    const sender = await User.findOne({ _id: invite.sender._id });
    const receiver = await User.findOne({ _id: invite.receiver._id });
    await Invite.updateOne({ _id: invite._id }, { status: 'declined' });

    await emailDeclineInvite(sender, receiver);
  },
});

InviteTC.addResolver({
  name: 'declineInvite',
  type: InviteTC,
  kind: 'mutation',
  args: { _id: 'MongoID!' },
  resolve: async ({ source, args, context }) => {
    async function allInvitesDeclined(invite) {
      const openInvites = await Invite.find({
        job: invite.job,
        status: { $ne: 'declined' },
      });
      return openInvites.length === 1 ? true : false;
    }

    const invite = await Invite.findOne({ _id: args._id });

    const allDeclined = await allInvitesDeclined(invite);
    allDeclined &&
      (await Job.updateOne({ _id: invite.job }, { submitted: 'totalDecline' }));

    await Contract.updateOne(
      { job: invite.job, user: invite.receiver._id },
      { status: 'declined' }
    );

    const sender = await User.findOne({ _id: invite.sender._id });
    const receiver = await User.findOne({ _id: invite.receiver._id });
    await Invite.updateOne({ _id: args._id }, { status: 'declined' });

    const notificationMessage = { ...DECLINED };
    notificationMessage.message = `${sender.name} ${notificationMessage.message}`;
    await Notification.create({ ...notificationMessage, user: sender._id });
    await emailDeclineInvite(sender, receiver);
    //email
  },
});

InviteTC.addRelation('receiver', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.receiver,
  },
  projection: { id: true },
});

InviteTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.job,
  },
  projection: { id: true },
});

import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, JobTC, Notification, User, Message } from './';
import { getUserId } from '../utils';
import { DECLINED } from '../utils/notifications';
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
        { status: { $in: rp.args.status } },
      ],
    });
    console.log(rp.args.status);

    return invites;
  },
});

InviteTC.addFields({
  messages: {
    type: 'Int', // String, Int, Float, Boolean, ID, Json
    description: 'message count',
    resolve: async (source, args, context, info) => {
      const userId = getUserId(context.headers.authorization);

      const messages = await Message.find({
        job: source.job,
        receiver: userId,
        status: 'unread',
        sender: source.receiver,
      });
      console.log(source.job, userId, messages);
      return messages ? messages.length : 0;
    },
  },
});

InviteTC.addResolver({
  name: 'declineInvite',
  type: InviteTC,
  kind: 'mutation',
  args: { _id: 'MongoID!' },
  resolve: async ({ source, args, context }) => {
    const invite = await Invite.findOne({ _id: args._id });
    const sender = await User.findOne({ _id: invite.sender._id });
    await Invite.updateOne({ _id: args._id }, { status: 'declined' });

    const notificationMessage = { ...DECLINED };
    notificationMessage.message = `${sender.name} ${notificationMessage.message}`;
    await Notification.create({ ...notificationMessage, user: sender._id });
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

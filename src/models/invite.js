import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, JobTC, Notification, User } from './';
import { getUserId } from '../utils';
import { DECLINED } from '../utils/notifications';
export const InviteSchema = new Schema(
  {
    title: { type: String },
    message: { type: String },
    status: { type: String },
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

InviteTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (parent) => ({ id: parent.user }),
  },
  projection: { id: true },
});

InviteTC.addResolver({
  name: 'invitesByUser',
  type: [InviteTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const invites = await Invite.find({
      $and: [{ receiver: userId }, { sender: { $ne: userId } }],
      status: { $nin: ['declined', 'closed'] },
    });

    return invites;
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

import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, JobTC, Notification } from './';
import { getUserId } from '../utils';
import { DECLINE } from '../utils/notifications';
export const InviteSchema = new Schema(
  {
    title: { type: String },
    message: { type: String },
    status: { type: String },
    user: {
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
    filter: (source) => ({ id: source._id }),
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
      receiver: userId,
      status: { $ne: 'declined' },
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
    const userId = getUserId(context.headers.authorization);
    await Invite.updateOne({ _id: args._id }, { status: 'declined' });
    //notification
    DECLINE.title = `${userId} ${DECLINE.title}`;
    await Notification.create({ ...DECLINE, user: userId });
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

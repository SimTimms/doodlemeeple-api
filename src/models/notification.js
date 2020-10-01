import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, JobTC } from './';
import { getUserId } from '../utils';

export const NotificationSchema = new Schema(
  {
    title: { type: String },
    message: { type: String },
    linkTo: { type: String },
    icon: { type: String },
    discarded: { type: Boolean },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'notifications',
  }
);

NotificationSchema.plugin(timestamps);
NotificationSchema.index({ createdAt: 1, updatedAt: 1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
export const NotificationTC = composeWithMongoose(Notification);

NotificationTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.user,
  },
  projection: { id: true },
});

NotificationTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.job,
  },
  projection: { id: true },
});

NotificationTC.addRelation('sender', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.sender,
  },
  projection: { id: true },
});

NotificationTC.addResolver({
  name: 'notificationSecure',
  args: {},
  type: [NotificationTC],
  kind: 'query',
  resolve: async (rp) => {
    return rp;
  },
});

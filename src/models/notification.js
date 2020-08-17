import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';
import { getUserId } from '../utils';

export const NotificationSchema = new Schema(
  {
    title: { type: String },
    message: { type: String },
    linkTo: { type: String },
    icon: { type: String },
    discarded: { type: Boolean },
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
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});

NotificationTC.addResolver({
  name: 'notificationSecure',
  args: {},
  type: [NotificationTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const newNotifications = await Notification.find({ user: userId })
      .sort({
        createdAt: -1,
      })
      .limit(10);
    return newNotifications;
  },
});

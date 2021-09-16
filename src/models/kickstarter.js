import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, ActivityLog } from './';
import { getUserId } from '../utils';
const ObjectId = mongoose.Types.ObjectId;

export const KickstarterSchema = new Schema(
  {
    name: { type: String },
    logo: { type: String },
    featuredImage: { type: String },
    summary: { type: String },
    url: { type: String },
    showreel: { type: String },
    approved: { type: Boolean },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'kickstarter',
  }
);

KickstarterSchema.plugin(timestamps);
KickstarterSchema.index({ createdAt: 1, updatedAt: 1 });

export const Kickstarter = mongoose.model('Kickstarter', KickstarterSchema);
export const KickstarterTC = composeWithMongoose(Kickstarter);

KickstarterTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.user) }),
  },
  projection: { _id: true },
});

KickstarterTC.addResolver({
  name: 'myKickstarters',
  args: {},
  type: [KickstarterTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await ActivityLog.create({
      action: 'my-kickstarters',
      actionBy: userId,
    });
    const kickstarters = await Kickstarter.find({
      user: userId,
    }).sort({ createdAt: -1 });

    return kickstarters;
  },
});

KickstarterTC.addResolver({
  name: 'featuredKickstarterWidget',
  args: {},
  type: [KickstarterTC],
  kind: 'query',
  resolve: async (rp) => {
    const kickstarters = await Kickstarter.find({
      approved: true,
      featuredImage: { $ne: '' },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return kickstarters;
  },
});

KickstarterTC.addResolver({
  name: 'kickstarterWidget',
  args: {},
  type: [KickstarterTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await ActivityLog.create({
      action: 'browse-kickstarters',
      actionBy: userId,
    });
    const kickstarters = await Kickstarter.find({
      approved: true,
      featuredImage: { $ne: '' },
    }).sort({ createdAt: -1 });

    return kickstarters;
  },
});

import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';
import { getUserId } from '../utils';

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
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});

KickstarterTC.addResolver({
  name: 'myKickstarters',
  args: {},
  type: [KickstarterTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
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
      .limit(3);

    return kickstarters;
  },
});

KickstarterTC.addResolver({
  name: 'kickstarterWidget',
  args: {},
  type: [KickstarterTC],
  kind: 'query',
  resolve: async (rp) => {
    const kickstarters = await Kickstarter.find({
      approved: true,
      featuredImage: { $ne: '' },
    }).sort({ createdAt: -1 });

    return kickstarters;
  },
});

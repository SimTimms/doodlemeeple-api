import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, GameTC, ActivityLog } from './';
import { getUserId } from '../utils';
const ObjectId = mongoose.Types.ObjectId;

export const MyPostSchema = new Schema(
  {
    name: { type: String },
    logo: { type: String },
    featuredImage: { type: String },
    summary: { type: String },
    url: { type: String },
    showreel: { type: String },
    type: { type: String },
    tags: [{ type: String }],
    approved: { type: Boolean },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
    },
  },
  {
    collection: 'myPost',
  }
);

MyPostSchema.plugin(timestamps);
MyPostSchema.index({ createdAt: 1, updatedAt: 1 });

export const MyPost = mongoose.model('MyPost', MyPostSchema);
export const MyPostTC = composeWithMongoose(MyPost);

MyPostTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.user) }),
  },
  projection: { _id: true },
});

MyPostTC.addRelation('game', {
  resolver: () => GameTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.game) }),
  },
  projection: { _id: true },
});

MyPostTC.addResolver({
  name: 'myPosts',
  args: {},
  type: [MyPostTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const myPosts = await MyPost.find({
      user: userId,
    }).sort({ createdAt: -1 });

    return myPosts;
  },
});

MyPostTC.addResolver({
  name: 'featuredMyPostWidget',
  args: {},
  type: [MyPostTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await ActivityLog.create({
      action: 'my-posts',
      actionBy: userId,
    });
    const myPosts = await MyPost.find({
      approved: true,
      featuredImage: { $ne: '' },
    }).sort({ createdAt: -1 });

    return myPosts;
  },
});

MyPostTC.addResolver({
  name: 'myPostsWidget',
  args: {},
  type: [MyPostTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await ActivityLog.create({
      action: 'browse-posts',
      actionBy: userId,
    });
    const myPosts = await MyPost.find({
      approved: true,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return myPosts;
  },
});

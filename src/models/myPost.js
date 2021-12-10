import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, GameTC, ActivityLog, Kickstarter, User, Game, Job } from './';
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
      .limit(15);

    return myPosts;
  },
});

MyPostTC.addResolver({
  name: 'postFeed',
  args: {},
  type: [MyPostTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    await User.updateOne({ _id: userId }, { lastOn: new Date() });

    const myPosts = await MyPost.find({
      approved: true,
    })
      .sort({ createdAt: -1 })
      .limit(15);

    const kickstarters = await Kickstarter.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(15);

    const kickstarterArranged = kickstarters.map((item) => {
      return {
        name: item.name,
        summary: item.summary,
        type: 'kickstarter',
        createdAt: item.createdAt,
        user: item.user._id,
        url: item.url,
        featuredImage: item.featuredImage,
      };
    });

    const jobs = await Job.find({ isPublic: true, approved: true })
      .sort({ createdAt: -1 })
      .limit(15);

    const jobsArranged = jobs.map((item) => {
      return {
        name: item.name,
        summary: item.summary,
        type: 'job',
        createdAt: item.createdAt,
        user: item.user._id,
      };
    });

    const users = await User.aggregate([
      {
        $match: {
          $and: [
            { profileImg: { $ne: '' } },
            { profileImg: { $ne: null } },
            { summary: { $ne: null } },
            { summary: { $ne: '' } },
            { sections: { $ne: [] } },
            { sections: { $ne: null } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 12 },
    ]);
    const usersArranged = users.map((item) => {
      return {
        name: item.name,
        summary: item.summary,
        type: 'newUser',
        createdAt: item.createdAt,
        user: item._id,
      };
    });

    const games = await Game.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(15);

    const gamesArranged = games.map((item) => {
      return {
        game: item._id,
        name: item.name,
        summary: item.summary,
        type: 'game',
        createdAt: item.createdAt,
        user: item.user._id,
        featuredImage: item.featuredImage,
      };
    });

    const usersSignedIn = await User.aggregate([
      {
        $match: {
          $and: [
            { profileImg: { $ne: '' } },
            { profileImg: { $ne: null } },
            { summary: { $ne: null } },
            { summary: { $ne: '' } },
            { sections: { $ne: [] } },
            { sections: { $ne: null } },
          ],
        },
      },
      { $sort: { lastOn: -1 } },
      { $limit: 10 },
    ]);
    const usersSignedInArranged = usersSignedIn.map((item) => {
      return {
        name: item.name,
        summary: item.summary,
        type: 'lastOn',
        createdAt: item.lastOn,
        user: item._id,
      };
    });

    const totalPosts = [
      ...kickstarterArranged,
      ...myPosts,
      ...usersArranged,
      ...gamesArranged,
      ...usersSignedInArranged,
      ...jobsArranged,
      //...jobsInviteArranged,
    ];

    const sortedPosts = totalPosts.sort((a, b) => b.createdAt - a.createdAt);

    return sortedPosts;
  },
});

import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import {
  UserTC,
  GameTC,
  JobTC,
  ActivityLog,
  Kickstarter,
  User,
  Game,
  Job,
} from './';
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
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
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

MyPostTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.job) }),
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
  args: { filter: ['String'] },
  type: [MyPostTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    await User.updateOne({ _id: userId }, { lastOn: new Date() });
    let myPosts = [];
    if (rp.args.filter.indexOf('public') > -1) {
      myPosts = await MyPost.find({
        approved: true,
      })
        .sort({ createdAt: -1 })
        .limit(15);
    }

    let kickstarterArranged = [];
    if (rp.args.filter.indexOf('kickstarter') > -1) {
      const kickstarters = await Kickstarter.find({ approved: true })
        .sort({ createdAt: -1 })
        .limit(15);

      kickstarterArranged = kickstarters.map((item) => {
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
    }

    let jobsArranged = [];
    if (rp.args.filter.indexOf('job') > -1) {
      const jobs = await Job.find({ isPublic: true, approved: true })
        .sort({ createdAt: -1 })
        .limit(15);

      jobsArranged = jobs.map((item) => {
        return {
          job: item._id,
          name: item.name,
          summary: item.summary,
          type: 'job',
          createdAt: item.createdAt,
          user: item.user._id,
        };
      });
    }

    let usersArranged = [];
    if (rp.args.filter.indexOf('newUser') > -1) {
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
      usersArranged = users.map((item) => {
        return {
          name: item.name,
          summary: item.summary,
          type: 'newUser',
          createdAt: item.createdAt,
          user: item._id,
        };
      });
    }

    let gamesArranged = [];
    if (rp.args.filter.indexOf('game') > -1) {
      const games = await Game.find().sort({ createdAt: -1 }).limit(15);

      gamesArranged = games.map((item) => {
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
    }

    let usersSignedInArranged = [];
    if (rp.args.filter.indexOf('lastOn') > -1) {
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
      usersSignedInArranged = usersSignedIn.map((item) => {
        return {
          name: item.name,
          summary: item.summary,
          type: 'lastOn',
          createdAt: item.lastOn,
          user: item._id,
        };
      });
    }

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

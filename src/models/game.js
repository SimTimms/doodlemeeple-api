import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, ActivityLog } from './';
import { getUserId } from '../utils';
const ObjectId = mongoose.Types.ObjectId;

const WebshopSchema = new Schema({
  name: { type: String },
  logo: { type: String },
  url: { type: String },
  price: { type: String },
});

const GamePostSchema = new Schema({
  name: { type: String },
  summary: { type: String },
  url: { type: String },
  video: { type: String },
  img: { type: String },
});

export const GameSchema = new Schema(
  {
    name: { type: String },
    logo: { type: String },
    featuredImage: { type: String },
    summary: { type: String },
    url: { type: String },
    showreel: { type: String },
    price: { type: String },
    webshop: { type: [WebshopSchema] },
    gamePost: { type: [GamePostSchema] },
    approved: { type: Boolean },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'games',
  }
);

GameSchema.plugin(timestamps);
GameSchema.index({ createdAt: 1, updatedAt: 1 });

export const Game = mongoose.model('Game', GameSchema);
export const GameTC = composeWithMongoose(Game);

GameTC.addResolver({
  name: 'myGames',
  args: {},
  type: [GameTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await ActivityLog.create({
      action: 'my-games',
      actionBy: userId,
    });
    const Games = await Game.find({
      user: userId,
    }).sort({ createdAt: -1 });

    return Games;
  },
});

GameTC.addResolver({
  name: 'featuredGameWidget',
  args: {},
  type: [GameTC],
  kind: 'query',
  resolve: async (rp) => {
    const Games = await Game.find({
      featuredImage: { $ne: '' },
      featuredImage: { $ne: null },
      summary: { $ne: null },
      summary: { $ne: '' },
      title: { $ne: null },
      title: { $ne: '' },
      $and: [{ url: { $ne: null } }, { url: { $ne: '' } }],
      approved: true,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return Games;
  },
});

GameTC.addResolver({
  name: 'gameWidget',
  args: {},
  type: [GameTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await ActivityLog.create({
      action: 'browse-games',
      actionBy: userId,
    });
    const Games = await Game.find({
      featuredImage: { $ne: '' },
      featuredImage: { $ne: null },
      summary: { $ne: null },
      summary: { $ne: '' },
      title: { $ne: null },
      title: { $ne: '' },
      $and: [{ url: { $ne: null } }, { url: { $ne: '' } }],
    }).sort({ createdAt: -1 });

    return Games;
  },
});

GameTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.user) }),
  },
  projection: { _id: true },
});

GameTC.addResolver({
  name: 'gamesByUser',
  type: [GameTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const games = await Game.find({ user: userId });
    return games;
  },
});

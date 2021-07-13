import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';
import { getUserId } from '../utils';

export const GameSchema = new Schema(
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
    const Games = await Game.find({
      featuredImage: { $ne: '' },
      featuredImage: { $ne: null },
      summary: { $ne: null },
      summary: { $ne: '' },
      title: { $ne: null },
      title: { $ne: '' },
    }).sort({ createdAt: -1 });

    return Games;
  },
});

GameTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
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

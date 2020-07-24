import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';

export const GameSchema = new Schema(
  {
    name: { type: String },
    keywords: [{ type: String }],
    img: { type: String },
    backgroundImg: { type: String },
    summary: { type: String },
    location: { type: String },
    showreel: { type: String },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: { type: String },
  },
  {
    collection: 'games',
  }
);

GameSchema.plugin(timestamps);
GameSchema.index({ createdAt: 1, updatedAt: 1 });

export const Game = mongoose.model('Game', GameSchema);
export const GameTC = composeWithMongoose(Game);
import { getUserId } from '../utils';

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

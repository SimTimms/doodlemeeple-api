import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';

export const FavouriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'favourites',
  }
);

FavouriteSchema.plugin(timestamps);

FavouriteSchema.index({ createdAt: 1, updatedAt: 1 });

export const Favourite = mongoose.model('Favourite', FavouriteSchema);
export const FavouriteTC = composeWithMongoose(Favourite);

FavouriteTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source.user }),
  },
  projection: { id: true },
});

FavouriteTC.addRelation('receiver', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: source.receiver }),
  },
  projection: { id: true },
});

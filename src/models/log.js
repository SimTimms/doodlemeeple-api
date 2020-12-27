import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';

export const LogSchema = new Schema(
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

LogSchema.plugin(timestamps);

LogSchema.index({ createdAt: 1, updatedAt: 1 });

export const Log = mongoose.model('Log', LogSchema);
export const LogTC = composeWithMongoose(Log);

LogTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source.user }),
  },
  projection: { id: true },
});

LogTC.addRelation('receiver', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: source.receiver }),
  },
  projection: { id: true },
});

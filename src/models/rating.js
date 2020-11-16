import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, JobTC, ContractTC } from './';

export const RatingSchema = new Schema(
  {
    rating: { type: Number },
    reviewText: { type: String },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    contract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
    },
  },
  {
    collection: 'ratings',
  }
);

export const Rating = mongoose.model('Testimonial', RatingSchema);
export const RatingTC = composeWithMongoose(Rating);

RatingTC.addRelation('creator', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.creator,
  },
  projection: { id: true },
});

RatingTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.job,
  },
  projection: { id: true },
});

RatingTC.addRelation('contract', {
  resolver: () => ContractTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.contract,
  },
  projection: { id: true },
});

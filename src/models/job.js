import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, GameTC, InviteTC } from './';
import { getUserId } from '../utils';

export const JobSchema = new Schema(
  {
    name: { type: String },
    keywords: [{ type: String }],
    img: { type: String },
    backgroundImg: { type: String },
    summary: { type: String },
    location: { type: String },
    showreel: { type: String },
    creativeSummary: { type: String },
    submitted: { type: String },
    invites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Invite',
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
    },
    type: { type: String },
  },
  {
    collection: 'jobs',
  }
);

JobSchema.plugin(timestamps);
JobSchema.index({ createdAt: 1, updatedAt: 1 });

export const Job = mongoose.model('Job', JobSchema);
export const JobTC = composeWithMongoose(Job);

JobTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});

JobTC.addRelation('game', {
  resolver: () => {
    return GameTC.getResolver('findOne');
  },
  prepareArgs: {
    filter: (source) => ({ _id: source._id }),
  },
  projection: { id: true },
});

JobTC.addRelation('invites', {
  resolver: () => {
    return InviteTC.getResolver('findMany');
  },
  prepareArgs: {
    _id: { $in: (source) => source.invites },
  },
  projection: { id: true },
});

JobTC.addResolver({
  name: 'jobsByUser',
  type: [JobTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobs = await Job.find({ user: userId });
    return jobs;
  },
});

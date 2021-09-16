import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import {
  GameTC,
  UserTC,
  KickstarterTC,
  MyPostTC,
  JobTC,
  InviteTC,
  SectionTC,
} from './';
const ObjectId = mongoose.Types.ObjectId;

export const ActivityLogSchema = new Schema(
  {
    action: {
      type: String,
    },
    value: { type: String },
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
    },
    kickstarter: {
      type: Schema.Types.ObjectId,
      ref: 'Kickstarter',
    },
    myPost: {
      type: Schema.Types.ObjectId,
      ref: 'MyPost',
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    invite: {
      type: Schema.Types.ObjectId,
      ref: 'Invite',
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },
  },
  {
    collection: 'activityLogs',
  }
);

ActivityLogSchema.plugin(timestamps);
ActivityLogSchema.index({ createdAt: 1, updatedAt: 1 });

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export const ActivityLogTC = composeWithMongoose(ActivityLog);

ActivityLogTC.addRelation('actionBy', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.actionBy) }),
  },
  projection: { _id: true },
});

ActivityLogTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.user) }),
  },
  projection: { _id: true },
});

ActivityLogTC.addRelation('game', {
  resolver: () => GameTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.game) }),
  },
  projection: { _id: true },
});

ActivityLogTC.addRelation('kickstarter', {
  resolver: () => KickstarterTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.kickstarter) }),
  },
  projection: { _id: true },
});

ActivityLogTC.addRelation('myPost', {
  resolver: () => MyPostTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.myPost) }),
  },
  projection: { _id: true },
});

ActivityLogTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.job) }),
  },
  projection: { _id: true },
});

ActivityLogTC.addRelation('invite', {
  resolver: () => InviteTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.invite) }),
  },
  projection: { _id: true },
});

ActivityLogTC.addRelation('section', {
  resolver: () => SectionTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ _id: ObjectId(source.section) }),
  },
  projection: { _id: true },
});

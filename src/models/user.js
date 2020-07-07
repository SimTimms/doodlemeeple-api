import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { SectionTC, NotificationTC } from './';
import { login } from '../resolvers';

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    resetToken: { type: String, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    password: { type: String, required: true },
    keywords: [{ type: String }],
    profileImg: { type: String },
    profileBG: { type: String },
    autosave: { type: String },
    summary: { type: String },
    location: { type: String },
    sections: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },
    notifications: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
    },
    token: { type: String },
  },
  {
    collection: 'users',
  },
);

UserSchema.plugin(timestamps);
UserSchema.index({ createdAt: 1, updatedAt: 1 });

export const User = mongoose.model('User', UserSchema);
export const UserTC = composeWithMongoose(User);

UserTC.addRelation('sections', {
  resolver: () => SectionTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (source) => source,
  },
});

UserTC.addRelation('notifications', {
  resolver: () => NotificationTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (source) => source,
  },
});

UserTC.addResolver({
  name: 'login',
  args: { email: 'String', password: 'String' },
  type: UserTC,
  kind: 'mutation',
  resolve: async ({ source, args }) => {
    return login(args);
  },
});

UserTC.addResolver({
  name: 'profile',
  args: { email: 'String', password: 'String' },
  type: UserTC,
  kind: 'mutation',
  resolve: async ({ source, args }) => {
    return login(args);
  },
});

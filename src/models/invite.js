import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';

export const InviteSchema = new Schema(
  {
    title: { type: String },
    message: { type: String },
    status: { type: String },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
  },
  {
    collection: 'invites',
  }
);

InviteSchema.plugin(timestamps);

InviteSchema.index({ createdAt: 1, updatedAt: 1 });

export const Invite = mongoose.model('Invite', InviteSchema);
export const InviteTC = composeWithMongoose(Invite);

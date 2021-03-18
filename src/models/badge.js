import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';

export const BadgeSchema = new Schema(
  {
    badgeType: {
      type: String,
    },
    link: {
      type: String,
    },
    userId: {
      type: String,
    },
    badgeIcon: {
      type: String,
    },
    description: { type: String },
  },
  {
    collection: 'badges',
  }
);

BadgeSchema.plugin(timestamps);
BadgeSchema.index({ createdAt: 1, updatedAt: 1 });

export const Badge = mongoose.model('Badge', BadgeSchema);
export const BadgeTC = composeWithMongoose(Badge);

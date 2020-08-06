import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, JobTC } from './';
import timestamps from 'mongoose-timestamp';
import { getUserId } from '../utils';
const ObjectId = mongoose.Types.ObjectId;
export const MessageSchema = new Schema(
  {
    messageStr: { type: String },
    status: { type: String },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
  },
  {
    collection: 'messages',
  }
);

MessageSchema.plugin(timestamps);
MessageSchema.index({ createdAt: 1, updatedAt: 1 });

export const Message = mongoose.model('Message', MessageSchema);
export const MessageTC = composeWithMongoose(Message);

MessageTC.addResolver({
  name: 'getMessages',
  args: {
    jobId: 'MongoID!',
    userId: 'MongoID!',
    pageNbr: 'Int!',
  },
  type: [MessageTC],
  kind: 'query',
  resolve: async (rp) => {
    const messages = await Message.find({
      $or: [{ receiver: rp.args.userId }, { sender: rp.args.userId }],
      job: rp.args.jobId,
    })
      .sort({ createdAt: -1 })
      .skip(rp.args.pageNbr * 10)
      .limit(10);

    await Message.updateMany(
      {
        $or: [{ receiver: rp.args.userId }, { sender: rp.args.userId }],
        job: rp.args.jobId,
      },
      { status: 'read' }
    );

    return messages;
  },
});

MessageTC.addRelation('sender', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.sender,
  },
  projection: { id: true },
});

MessageTC.addRelation('receiver', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.receiver,
  },
  projection: { id: true },
});

MessageTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.job,
  },
  projection: { id: true },
});

MessageTC.addResolver({
  name: 'getConversations',
  args: {},
  type: [MessageTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ reciever: ObjectId(userId) }, { sender: ObjectId(userId) }],
        },
      },
      {
        $group: {
          _id: '$job',
          messageStr: { $first: '$messageStr' },
          receiver: { $first: '$receiver' },
          sender: { $first: '$sender' },
          job: { $first: '$job' },
        },
      },
    ]);

    console.log(messages);

    return messages;
  },
});

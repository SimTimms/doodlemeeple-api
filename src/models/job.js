import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import {
  UserTC,
  GameTC,
  InviteTC,
  Notification,
  Invite,
  User,
  ContractTC,
  Contract,
  GalleryTC,
} from './';
import { ContractSchema } from './contract';
import { UserSchema } from './user';
import { InviteSchema } from './invite';
import { getUserId } from '../utils';
import { INVITED } from '../utils/notifications';
import { emailInvite, earlyClosure } from '../email';
const ObjectId = mongoose.Types.ObjectId;

export const JobSchema = new Schema(
  {
    name: { type: String },
    genre: { type: String },
    keywords: [{ type: String }],
    img: { type: String },
    backgroundImg: { type: String },
    summary: { type: String },
    funded: { type: Boolean },
    speculative: { type: Boolean },
    inLieu: { type: Boolean },
    scope: { type: String },
    mechanics: { type: String },
    timeframe: { type: String },
    budget: { type: String },
    extra: { type: String },
    termsAccepted: { type: Boolean },
    location: { type: String },
    showreel: { type: String },
    creativeSummary: { type: String },
    submitted: { type: String },
    contactEmail: { type: String },
    paid: { type: String },
    format: [{ type: String }],
    imageRes: { type: String },
    isPublic: { type: Boolean },
    isExternal: { type: Boolean },
    externalLink: { type: String },
    externalSource: { type: String },
    sourceLink: { type: String },
    approved: { type: Boolean },
    gallery: {
      type: Schema.Types.ObjectId,
      ref: 'Gallery',
    },
    invites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Invite',
      },
    ],
    assignedCreative: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    contracts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
      },
    ],
    activeContract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
    },
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

JobTC.addResolver({
  name: 'jobWidget',
  args: { jobId: 'MongoID!' },
  type: JobTC,
  kind: 'query',
  resolve: async (rp) => {
    const job = await Job.findOne({
      _id: rp.args.jobId,
    });

    return job;
  },
});

JobTC.addResolver({
  name: 'jobBoardWidget',
  type: [JobTC],
  kind: 'query',
  resolve: async (rp) => {
    const jobs = await Job.find({
      isPublic: true,
      submitted: { $ne: 'accepted' },
      approved: true,
    }).sort({ createdAt: -1 });

    return jobs;
  },
});

JobTC.addResolver({
  name: 'jobBoardMiniWidget',
  type: [JobTC],
  kind: 'query',
  resolve: async (rp) => {
    const jobs = await Job.find({
      isPublic: true,
      $and: [
        { submitted: { $ne: 'accepted' } },
        { submitted: { $ne: 'closed' } },
      ],
      approved: true,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return jobs;
  },
});

JobTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.user,
  },
  projection: { id: true },
});

JobTC.addRelation('gallery', {
  resolver: () => GalleryTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.gallery,
  },
  projection: { id: true },
});

JobTC.addRelation('assignedCreative', {
  resolver: () => {
    return UserTC.getResolver('findOne');
  },
  prepareArgs: {
    filter: (parent) => ({ _id: { $in: parent.assignedCreative } }),
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
    filter: (parent) => ({ _id: { $in: parent.invites } }),
  },
  projection: { id: true },
});

JobTC.addRelation('contracts', {
  resolver: () => {
    return ContractTC.getResolver('findMany');
  },
  prepareArgs: {
    filter: (parent) => ({ _id: { $in: parent.contracts } }),
  },
  projection: { id: true },
});

JobTC.addRelation('activeContract', {
  resolver: () => ContractTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.activeContract,
  },
  projection: { id: true },
});

JobTC.addResolver({
  name: 'jobsByUser',
  type: [JobTC],
  args: { status: ['String'] },
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobs = await Job.find({
      user: userId,
      submitted: { $in: rp.args.status },
    }).sort({
      updatedAt: -1,
    });

    return jobs;
  },
});

JobTC.addResolver({
  name: 'closeJob',
  type: JobTC,
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await Job.updateOne(
      { _id: rp.args._id, user: userId },
      { submitted: 'closed' }
    );
    await Invite.updateMany(
      { job: rp.args._id, status: { $ne: 'declined' } },
      { status: 'closed' }
    );

    await Contract.updateMany({ job: rp.args._id }, { status: 'job_closed' });
    return null;
  },
});

JobTC.addResolver({
  name: 'openJob',
  type: JobTC,
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await Job.updateOne(
      { _id: rp.args._id, user: userId },
      { submitted: 'draft' }
    );

    return null;
  },
});

JobTC.addResolver({
  name: 'completeJob',
  type: JobTC,
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    await Job.updateOne(
      { _id: rp.args._id, user: userId },
      { submitted: 'complete' }
    );
    return null;
  },
});

JobTC.addResolver({
  name: 'submitPublicBrief',
  type: 'Boolean',
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async ({ source, args, context, info }) => {
    const jobId = args._id;
    const jobDeets = await Job.findOne({ _id: jobId });

    await Job.updateOne(
      { _id: jobId },
      { submitted: 'submitted', isPublic: true }
    );

    return true;
  },
});

JobTC.addResolver({
  name: 'acceptTerms',
  type: 'Boolean',
  args: {
    _id: 'MongoID!',
    termsAccepted: 'Boolean!',
  },
  kind: 'mutation',
  resolve: async ({ source, args, context, info }) => {
    await Job.updateOne(
      { _id: args._id },
      { termsAccepted: args.termsAccepted }
    );
    return true;
  },
});

JobTC.addResolver({
  name: 'submitBrief',
  type: JobTC,
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async ({ source, args, context, info }) => {
    const jobId = args._id;
    const jobDeets = await Job.findOne({ _id: jobId });
    const invites = await Invite.find({ _id: { $in: jobDeets.invites } });
    await Invite.updateMany(
      { _id: { $in: jobDeets.invites } },
      { status: 'unopened' }
    );
    const inviteIds = invites.map((invite) => invite.receiver);
    const invitees = await User.find({ _id: { $in: inviteIds } });
    await Job.updateOne({ _id: jobId }, { submitted: 'submitted' });

    const notifications = invitees.map(async (user) => {
      const notificationMessage = { ...INVITED };

      notificationMessage.message = `${jobDeets.name}`;
      notificationMessage.linkTo = `${notificationMessage.linkTo}`;
      await Notification.create({ ...notificationMessage, user: user._id });
    });

    Promise.all(notifications).then();

    invitees.map((user) => {
      const request = emailInvite(user, jobDeets);

      request
        .then((result) => {
          //  console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
});

JobTC.addResolver({
  name: 'submitBriefSingle',
  type: JobTC,
  args: {
    _id: 'MongoID!',
    userId: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async ({ source, args, context, info }) => {
    const jobId = args._id;
    const jobDeets = await Job.findOne({ _id: jobId });
    await Invite.create({
      receiver: args.userId,
      job: jobId,
      sender: jobDeets.user._id,
      status: 'unopened',
    });

    const invitee = await User.findOne({ _id: args.userId });
    await Job.updateOne({ _id: jobId }, { submitted: 'submitted' });

    const notificationMessage = { ...INVITED };
    notificationMessage.message = `${jobDeets.name}`;
    notificationMessage.linkTo = `${notificationMessage.linkTo}`;
    await Notification.create({ ...notificationMessage, user: invitee._id });

    const request = await emailInvite(invitee, jobDeets);
  },
});

export const ChecklistSchema = new Schema({
  contract: {
    type: ContractSchema,
  },
  creator: {
    type: UserSchema,
  },
  job: {
    type: JobSchema,
  },
  invite: { type: InviteSchema },
});

export const Checklist = mongoose.model('Checklist', ChecklistSchema);
export const ChecklistTC = composeWithMongoose(Checklist);

JobTC.addResolver({
  name: 'jobHistory',
  type: [JobTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobs = await Job.find({
      user: userId,
      submitted: { $in: ['declined', 'rejected', 'closed'] },
    }).sort({
      updatedAt: -1,
    });

    return jobs;
  },
});

JobTC.addResolver({
  name: 'workHistory',
  type: [JobTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const invites = await Invite.find({
      receiver: userId,
      status: { $in: ['declined', 'closed'] },
    }).sort({
      updatedAt: -1,
    });

    const jobs = await Job.find({
      _id: { $in: invites.map((item) => item.job._id) },
    }).sort({
      updatedAt: -1,
    });

    return jobs;
  },
});

JobTC.addResolver({
  name: 'jobChecklist',
  type: ChecklistTC,
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobId = rp.args._id;

    const job = await Job.findOne({ _id: jobId });
    const creator = await User.findOne({ _id: job.user });
    const contract = await Contract.findOne({ job: jobId, user: userId });
    const invite = await Invite.findOne({ job: jobId, receiver: userId });

    const newObj = {
      contract: contract,
      creator: creator,
      job: job,
      invite: invite,
    };
    return newObj;
  },
});

JobTC.addResolver({
  name: 'closeEarly',
  type: 'String',
  args: {
    _id: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobId = rp.args._id;
    const job = await Job.findOne({ _id: jobId, user: userId });
    const creator = await User.findOne({ _id: userId });

    const request = earlyClosure(creator, job);

    request
      .then((result) => {
        //  console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
    return 'OK';
  },
});

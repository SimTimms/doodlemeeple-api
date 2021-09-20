import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import {
  SectionTC,
  NotificationTC,
  GalleryTC,
  ImageTC,
  NotableProjectTC,
  TestimonialTC,
  Section,
  Image,
  NotableProject,
  Testimonial,
  Gallery,
  InviteTC,
  Invite,
  FavouriteTC,
  Favourite,
  BadgeTC,
  ActivityLog,
} from './';
const ObjectId = mongoose.Types.ObjectId;
const { emailReset, emailForgot } = require('../email');
import { login, userMigrate } from '../resolversNew';
import { getUserId, signupChecks } from '../utils';
import aws from 'aws-sdk';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

aws.config.update({
  region: 'eu-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const S3_BUCKET = process.env.BUCKET;
var s3 = new aws.S3();

const WebshopSchema = new Schema({
  name: { type: String },
  logo: { type: String },
  url: { type: String },
  price: { type: String },
});

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
    creatorTrue: { type: Boolean, default: false },
    creativeTrue: { type: Boolean, default: false },
    facebook: { type: String },
    twitter: { type: String },
    website: { type: String },
    lastOn: { type: Date },
    instagram: { type: String },
    linkedIn: { type: String },
    publicEmail: { type: String },
    skype: { type: String },
    phone: { type: String },
    password: { type: String, required: true },
    keywords: [{ type: String }],
    profileImg: { type: String },
    profileBG: { type: String },
    autosave: { type: String },
    summary: { type: String },
    location: { type: String },
    onboarding: { type: String },
    creatorOnboardSkip: { type: Boolean },
    rating: { type: Number },
    stripeID: { type: String },
    stripeStatus: { type: String },
    stripeEmail: { type: String },
    stripeRefresh: { type: String },
    stripeAccess: { type: String },
    stripeClientId: { type: String },
    termsAccepted: { type: Boolean },
    acceptsSpeculative: { type: Boolean },
    acceptsRoyalties: { type: Boolean },
    acceptsUnfunded: { type: Boolean },
    available: { type: Boolean },
    paymentMethod: { type: String },
    viewCount: { type: Number },
    responsePercent: { type: Number },
    priority: { type: Number },
    campaignId: { type: String },
    badges: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Badges',
      },
    ],
    favourites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Favourites',
      },
    ],
    likedMe: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Favourites',
      },
    ],
    invites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Invites',
      },
    ],
    sections: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
    notifications: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
    },
    webshop: { type: [WebshopSchema] },
    token: { type: String },
  },
  {
    collection: 'users',
  }
);

UserSchema.plugin(timestamps);
UserSchema.index({ createdAt: 1, updatedAt: 1 });

export const User = mongoose.model('User', UserSchema);
export const UserTC = composeWithMongoose(User);

export const StripeSchema = new Schema({
  object: { type: String },
  details_submitted: { type: Boolean },
  payouts_enabled: { type: Boolean },
});

const Stripe = mongoose.model('Stripe', StripeSchema);
const StripeTC = composeWithMongoose(Stripe);

UserTC.addResolver({
  name: 'profile',
  args: {},
  type: UserTC,
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const user = await User.findOne({ _id: userId });

    return user;
  },
});

UserTC.addRelation('badges', {
  resolver: () => BadgeTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (parent) => parent.badges,
  },
  projection: { id: true },
});

UserTC.addResolver({
  name: 'skipOnboarding',
  args: {},
  type: 'Boolean',
  kind: 'mutation',
  resolve: async (rp) => {
    return true;
  },
});

UserTC.addResolver({
  name: 'getCreatives',
  args: { type: ['String'], page: 'Int', job: 'MongoID' },
  type: [UserTC],
  kind: 'query',
  resolve: async (rp) => {
    const sections = await Section.find({
      type: { $in: rp.args.type },
    });

    const sectionUserIds = sections.map((section) => ObjectId(section.user));

    const users = await User.find({
      $and: [
        { _id: { $in: sectionUserIds } },
        { profileImg: { $ne: '' } },
        { profileImg: { $ne: null } },
        { summary: { $ne: null } },
        { summary: { $ne: '' } },
        { available: { $ne: false } },
      ],
    })
      .skip(rp.args.page * 12)
      .limit(12)
      .sort({
        priority: -1,
        badges: -1,
        profileBG: -1,
        profileImg: -1,
        createdAt: -1,
      });

    return users;
  },
});

UserTC.addResolver({
  name: 'featuredProfile',
  args: { userId: 'MongoID' },
  type: UserTC,
  kind: 'query',
  resolve: async (rp) => {
    const user = await User.findOne({ _id: rp.args.userId });

    return user;
  },
});

UserTC.addResolver({
  name: 'latestCreativesWidget',
  args: {},
  type: [UserTC],
  kind: 'query',
  resolve: async (rp) => {
    const users = await User.aggregate([
      {
        $match: {
          $and: [
            { profileImg: { $ne: '' } },
            { profileImg: { $ne: null } },
            { summary: { $ne: null } },
            { summary: { $ne: '' } },
            { sections: { $ne: [] } },
            { sections: { $ne: null } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 12 },
    ]);

    return users;
  },
});

UserTC.addResolver({
  name: 'featuredCreativesWidget',
  args: {},
  type: [UserTC],
  kind: 'query',
  resolve: async (rp) => {
    const users = await User.aggregate([
      {
        $match: {
          $and: [
            { profileImg: { $ne: '' } },
            { profileImg: { $ne: null } },
            { profileBG: { $ne: '' } },
            { profileBG: { $ne: null } },
            { summary: { $ne: null } },
            { summary: { $ne: '' } },
            { sections: { $ne: [] } },
            { sections: { $ne: null } },
            { priority: 0 },
          ],
        },
      },
      { $sample: { size: 6 } },
    ]);

    return users;
  },
});

UserTC.addResolver({
  name: 'creativeRosterWidget',
  args: { page: 'Int', filter: ['String'] },
  type: [UserTC],
  kind: 'query',
  resolve: async (rp) => {
    const sections = await Section.find({
      type: { $in: rp.args.filter },
    });

    const sectionUserIds = sections.map((section) => ObjectId(section.user));

    const users = await User.aggregate([
      {
        $match: {
          $and: [
            { _id: { $in: sectionUserIds } },
            { profileImg: { $ne: '' } },
            { profileImg: { $ne: null } },
            { summary: { $ne: null } },
            { summary: { $ne: '' } },
          ],
        },
      },
      {
        $project: {
          name: 1,
          summary: 1,
          profileImg: 1,
          profileBG: 1,
          linkedIn: 1,
          twitter: 1,
          instagram: 1,
          website: 1,
          facebook: 1,
          publicEmail: 1,
          viewCount: 1,
          createdAt: 1,
          priority: 1,
          lastOn: 1,
          resultBG: { $not: [{ $ne: ['$profileBG', null] }] },
          resultFB: { $not: [{ $ne: ['$facebook', ''] }] },
          resultTwitter: { $not: [{ $ne: ['$twitter', ''] }] },
          resultLinkedIn: { $not: [{ $ne: ['$linkedIn', ''] }] },
          resultInstagram: { $not: [{ $ne: ['$instagram', ''] }] },
          resultPublicEmail: { $not: [{ $ne: ['$publicEmail', ''] }] },
          resultWebsite: { $not: [{ $ne: ['$website', ''] }] },
          linkedIn: { $ifNull: ['$linkedIn', ''] },
          twitter: { $ifNull: ['$twitter', ''] },
          instagram: { $ifNull: ['$instagram', ''] },
          website: { $ifNull: ['$website', ''] },
          facebook: { $ifNull: ['$facebook', ''] },
          publicEmail: { $ifNull: ['$publicEmail', ''] },
          priority: { $ifNull: ['$priority', 5] },
        },
      },
      {
        $sort: {
          priority: 1,
          resultBG: 1,
          resultFB: 1,
          resultTwitter: 1,
          resultLinkedIn: 1,
          resultInstagram: 1,
          resultPublicEmail: 1,
          resultWebsite: 1,
          viewCount: 1,
          createdAt: -1,
        },
      },
      { $skip: rp.args.page * 12 },
      { $limit: 12 },
    ]);

    console.log(users);

    return users;
  },
});

UserTC.addFields({
  responsePercent: {
    type: 'String', // String, Int, Float, Boolean, ID, Json
    description: 'response rate ',
    resolve: async (source, args, context, info) => {
      const invites = await Invite.find({ receiver: source._id });
      const invitesUnactioned = invites.filter(
        (item) => item.status === 'read'
      );
      const percentResponse = 1 - invitesUnactioned.length / invites.length;

      return !isNaN(percentResponse)
        ? `${Math.ceil(percentResponse * 100)}`
        : '';
    },
  },
});

UserTC.addResolver({
  name: 'getLikes',
  args: { type: ['String'] },
  type: [UserTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const favourites = await Favourite.find({
      receiver: userId,
    }).limit(50);
    const userIds = favourites.map((favourites) => ObjectId(favourites.user));
    const users = await User.find({ _id: { $in: userIds } }).limit(50);
    return users;
  },
});

UserTC.addResolver({
  name: 'creativeMinis',
  args: { count: 'Int' },
  type: [UserTC],
  kind: 'query',
  resolve: async (rp) => {
    let users = await User.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          profileImg: { $ne: null },
          profileBG: { $ne: null },
          name: { $ne: null },
          summary: { $ne: null },
        },
      },
      { $limit: rp.args.count },
    ]);

    return users;
  },
});

UserTC.addRelation('sections', {
  resolver: () => SectionTC.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => ({ user: source._id }),
  },
  projection: { id: true },
});

UserTC.addRelation('invites', {
  resolver: () => InviteTC.getResolver('findMany'),
  prepareArgs: {
    receiver: (source) => source._id,
  },
  projection: { id: true },
});

UserTC.addRelation('favourites', {
  resolver: () => FavouriteTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (parent) => parent.favourites,
  },
  projection: { id: true },
});

UserTC.addRelation('likedMe', {
  resolver: () => FavouriteTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (parent) => parent.likedMe,
  },
  projection: { id: true },
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
    await ActivityLog.create({ action: 'login', value: args.email });
    await User.updateOne({ email: args.email }, { lastOn: new Date() });
    return login(args);
  },
});

UserTC.addResolver({
  name: 'userByIdWithTracker',
  args: { _id: 'MongoID!' },
  type: UserTC,
  kind: 'mutation',
  resolve: async ({ source, args, context }) => {
    const userId = getUserId(context.headers.authorization);
    await ActivityLog.create({
      action: 'profile-view',
      actionBy: userId,
      user: args._id,
    });

    const user = await User.findOne({
      _id: args._id,
    });

    user &&
      userId !== user._id &&
      (await User.updateOne(
        { _id: args._id },
        { viewCount: user.viewCount ? user.viewCount + 1 : 1 }
      ));

    return user;
  },
});

UserTC.addResolver({
  name: 'getStripe',
  type: StripeTC,
  kind: 'query',
  resolve: async () => {},
});

UserTC.addResolver({
  name: 'userMigrate',
  args: {
    username: 'String',
    email: 'String',
    password: 'String',
    profileImg: 'String',
    profileBG: 'String',
    summary: 'String',
    sections: () => [SectionTC.getInputType()],
    galleries: () => [GalleryTC.getInputType()],
    images: () => [ImageTC.getInputType()],
    testimonials: () => [TestimonialTC.getInputType()],
    notableProjects: () => [NotableProjectTC.getInputType()],
  },
  type: UserTC,
  kind: 'mutation',
  resolve: async ({ source, args }) => {
    return userMigrate(args);
  },
});

UserTC.addResolver({
  name: 'deleteAccount',
  type: UserTC,
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const userData = await User.findOne({ _id: userId });
    const sections = await Section.find({ user: userId });
    const galleryIds = sections.map((section) => {
      return section.gallery;
    });
    const sectionIds = sections.map((section) => {
      return section._id;
    });
    const images = await Image.find({ user: userId });
    const imageIds = images.map((item) => item._id);
    const testimonials = await Testimonial.find({
      section: { $in: sectionIds },
    });
    const testimonialIds = testimonials.map((item) => item._id);
    const projects = await NotableProject.find({
      section: { $in: sectionIds },
    });
    const projectIds = projects.map((item) => item._id);

    var imageDelete = images.map(async (image) => {
      const params = {
        Bucket: S3_BUCKET,
        Key: image.img.replace('https://dm-uploads-uk.s3.amazonaws.com/', ''),
      };
      await s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log('deleted'); // deleted
      });
    });

    let params = {
      Bucket: S3_BUCKET,
      Key: userData.profileImg.replace(
        'https://dm-uploads-uk.s3.amazonaws.com/',
        ''
      ),
    };

    await s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log('deleted'); // deleted
    });

    params = {
      Bucket: S3_BUCKET,
      Key: userData.profileBG.replace(
        'https://dm-uploads-uk.s3.amazonaws.com/',
        ''
      ),
    };
    await s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log('deleted'); // deleted
    });

    Promise.all(imageDelete).then(function (results) {
      console.log('Deleted');
    });

    await Section.deleteMany({ _id: { $in: sectionIds } });
    await Testimonial.deleteMany({ _id: { $in: testimonialIds } });
    await NotableProject.deleteMany({ _id: { $in: projectIds } });
    await Image.deleteMany({ _id: { $in: imageIds } });
    await Gallery.deleteMany({ _id: { $in: galleryIds } });
    await User.deleteOne({ _id: userData._id });

    return true;
  },
});

UserTC.addResolver({
  name: 'updateProfile',
  args: {
    name: 'String',
    summary: 'String',
    profileBG: 'String',
    profileImg: 'String',
  },
  type: UserTC,
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const user = await User.updateOne({ _id: userId }, { ...rp.args });

    return user;
  },
});

UserTC.addResolver({
  name: 'passwordForgot',
  args: {
    email: 'String',
  },
  type: UserTC,
  kind: 'mutation',
  resolve: async (rp) => {
    const user = await User.findOne({
      email: rp.args.email,
    });

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    await User.updateOne(
      { _id: user._id },
      {
        resetToken: token,
      }
    );

    const actionLink = `${process.env.EMAIL_URL}/password-reset/${token}`;
    const request = emailForgot(user, actionLink);

    request
      .then((result) => {})
      .catch((err) => {
        console.log(err.statusCode);
      });

    return true;
  },
});

UserTC.addResolver({
  name: 'passwordReset',
  args: {
    token: 'String',
    password: 'String',
  },
  type: 'Boolean',
  kind: 'mutation',
  resolve: async (rp) => {
    const user = await User.findOne({
      resetToken: rp.args.token,
    });

    const validSubmission = signupChecks({
      password: rp.args.password,
      name: user.name,
      email: user.email,
    });

    if (validSubmission === false) {
      throw new Error('Submission Failed');
    }

    const password = await bcrypt.hash(rp.args.password, 10);

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        resetToken: null,
        password: password,
      }
    );

    if (user) {
      const actionLink = `${process.env.EMAIL_URL}`;
      const request = emailReset(user, actionLink);

      request
        .then((result) => {})
        .catch((err) => {
          console.log(err.statusCode);
        });

      return true;
    } else {
      return false;
    }
  },
});

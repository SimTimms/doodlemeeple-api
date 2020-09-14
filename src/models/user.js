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
  FavouriteTC,
} from './';
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

UserTC.addResolver({
  name: 'getCreatives',
  args: {},
  type: [UserTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const user = await User.find({ _id: { $ne: userId } }).sort({
      profileBG: -1,
      summary: -1,
      profileImg: -1,
    });

    return user;
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
    return login(args);
  },
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

    console.log(user, rp.args.token);

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
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err.statusCode);
        });

      return true;
    } else {
      return false;
    }
  },
});

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
} from './';
import { login, userMigrate } from '../resolvers';
import { getUserId } from '../utils';
import aws from 'aws-sdk';

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
    favourites: [{ type: String }],
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

UserTC.addRelation('sections', {
  resolver: () => SectionTC.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => ({ user: source._id }),
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
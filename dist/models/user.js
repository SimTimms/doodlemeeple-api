"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserTC = exports.User = exports.UserSchema = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongooseTimestamp = _interopRequireDefault(require("mongoose-timestamp"));

var _graphqlComposeMongoose = require("graphql-compose-mongoose");

var _ = require("./");

var _resolversNew = require("../resolversNew");

var _utils = require("../utils");

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_awsSdk.default.config.update({
  region: 'eu-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const S3_BUCKET = process.env.BUCKET;
var s3 = new _awsSdk.default.S3();
const UserSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  profileImg: {
    type: String
  },
  profileBG: {
    type: String
  },
  autosave: {
    type: String
  },
  summary: {
    type: String
  },
  location: {
    type: String
  },
  favourites: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Favourites'
  }],
  likedMe: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Favourites'
  }],
  invites: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Invites'
  }],
  sections: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  notifications: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  },
  token: {
    type: String
  }
}, {
  collection: 'users'
});
exports.UserSchema = UserSchema;
UserSchema.plugin(_mongooseTimestamp.default);
UserSchema.index({
  createdAt: 1,
  updatedAt: 1
});

const User = _mongoose.default.model('User', UserSchema);

exports.User = User;
const UserTC = (0, _graphqlComposeMongoose.composeWithMongoose)(User);
exports.UserTC = UserTC;
UserTC.addResolver({
  name: 'profile',
  args: {},
  type: UserTC,
  kind: 'query',
  resolve: async rp => {
    const userId = (0, _utils.getUserId)(rp.context.headers.authorization);
    const user = await User.findOne({
      _id: userId
    });
    return user;
  }
});
UserTC.addResolver({
  name: 'getCreatives',
  args: {},
  type: [UserTC],
  kind: 'query',
  resolve: async rp => {
    const userId = (0, _utils.getUserId)(rp.context.headers.authorization);
    const user = await User.find({
      _id: {
        $ne: userId
      }
    });
    return user;
  }
});
UserTC.addRelation('sections', {
  resolver: () => _.SectionTC.getResolver('findMany'),
  prepareArgs: {
    filter: source => ({
      user: source._id
    })
  },
  projection: {
    id: true
  }
});
UserTC.addRelation('invites', {
  resolver: () => _.InviteTC.getResolver('findMany'),
  prepareArgs: {
    receiver: source => source._id
  },
  projection: {
    id: true
  }
});
UserTC.addRelation('favourites', {
  resolver: () => _.FavouriteTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: parent => parent.favourites
  },
  projection: {
    id: true
  }
});
UserTC.addRelation('likedMe', {
  resolver: () => _.FavouriteTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: parent => parent.likedMe
  },
  projection: {
    id: true
  }
});
UserTC.addRelation('notifications', {
  resolver: () => _.NotificationTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: source => source
  }
});
UserTC.addResolver({
  name: 'login',
  args: {
    email: 'String',
    password: 'String'
  },
  type: UserTC,
  kind: 'mutation',
  resolve: async ({
    source,
    args
  }) => {
    return (0, _resolversNew.login)(args);
  }
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
    sections: () => [_.SectionTC.getInputType()],
    galleries: () => [_.GalleryTC.getInputType()],
    images: () => [_.ImageTC.getInputType()],
    testimonials: () => [_.TestimonialTC.getInputType()],
    notableProjects: () => [_.NotableProjectTC.getInputType()]
  },
  type: UserTC,
  kind: 'mutation',
  resolve: async ({
    source,
    args
  }) => {
    return (0, _resolversNew.userMigrate)(args);
  }
});
UserTC.addResolver({
  name: 'deleteAccount',
  type: UserTC,
  kind: 'mutation',
  resolve: async rp => {
    const userId = (0, _utils.getUserId)(rp.context.headers.authorization);
    const userData = await User.findOne({
      _id: userId
    });
    const sections = await _.Section.find({
      user: userId
    });
    const galleryIds = sections.map(section => {
      return section.gallery;
    });
    const sectionIds = sections.map(section => {
      return section._id;
    });
    const images = await _.Image.find({
      user: userId
    });
    const imageIds = images.map(item => item._id);
    const testimonials = await _.Testimonial.find({
      section: {
        $in: sectionIds
      }
    });
    const testimonialIds = testimonials.map(item => item._id);
    const projects = await _.NotableProject.find({
      section: {
        $in: sectionIds
      }
    });
    const projectIds = projects.map(item => item._id);
    var imageDelete = images.map(async image => {
      const params = {
        Bucket: S3_BUCKET,
        Key: image.img.replace('https://dm-uploads-uk.s3.amazonaws.com/', '')
      };
      await s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);else console.log('deleted'); // deleted
      });
    });
    let params = {
      Bucket: S3_BUCKET,
      Key: userData.profileImg.replace('https://dm-uploads-uk.s3.amazonaws.com/', '')
    };
    await s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);else console.log('deleted'); // deleted
    });
    params = {
      Bucket: S3_BUCKET,
      Key: userData.profileBG.replace('https://dm-uploads-uk.s3.amazonaws.com/', '')
    };
    await s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);else console.log('deleted'); // deleted
    });
    Promise.all(imageDelete).then(function (results) {
      console.log('Deleted');
    });
    await _.Section.deleteMany({
      _id: {
        $in: sectionIds
      }
    });
    await _.Testimonial.deleteMany({
      _id: {
        $in: testimonialIds
      }
    });
    await _.NotableProject.deleteMany({
      _id: {
        $in: projectIds
      }
    });
    await _.Image.deleteMany({
      _id: {
        $in: imageIds
      }
    });
    await _.Gallery.deleteMany({
      _id: {
        $in: galleryIds
      }
    });
    await User.deleteOne({
      _id: userData._id
    });
    return true;
  }
});
UserTC.addResolver({
  name: 'updateProfile',
  args: {
    name: 'String',
    summary: 'String',
    profileBG: 'String',
    profileImg: 'String'
  },
  type: UserTC,
  kind: 'mutation',
  resolve: async rp => {
    const userId = (0, _utils.getUserId)(rp.context.headers.authorization);
    const user = await User.updateOne({
      _id: userId
    }, { ...rp.args
    });
    return user;
  }
});
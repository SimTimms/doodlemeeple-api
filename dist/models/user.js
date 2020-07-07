"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserTC = exports.User = exports.UserSchema = undefined;

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseTimestamp = require("mongoose-timestamp");

var _mongooseTimestamp2 = _interopRequireDefault(_mongooseTimestamp);

var _graphqlComposeMongoose = require("graphql-compose-mongoose");

var _ = require("./");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bcrypt = require('bcryptjs');

const UserSchema = exports.UserSchema = new _mongoose.Schema({
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
  sections: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }
}, {
  collection: 'users'
});
UserSchema.plugin(_mongooseTimestamp2.default);
UserSchema.index({
  createdAt: 1,
  updatedAt: 1
});

const User = exports.User = _mongoose2.default.model('User', UserSchema);

const UserTC = exports.UserTC = (0, _graphqlComposeMongoose.composeWithMongoose)(User);
UserTC.addRelation('sections', {
  resolver: () => _.SectionTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: source => source
  }
});
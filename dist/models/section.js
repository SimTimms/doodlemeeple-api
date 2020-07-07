"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SectionTC = exports.Section = exports.SectionSchema = undefined;

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseTimestamp = require("mongoose-timestamp");

var _mongooseTimestamp2 = _interopRequireDefault(_mongooseTimestamp);

var _graphqlComposeMongoose = require("graphql-compose-mongoose");

var _ = require("./");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SectionSchema = exports.SectionSchema = new _mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  showreel: {
    type: String
  },
  type: {
    type: String
  },
  user: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  collection: 'sections'
});
SectionSchema.plugin(_mongooseTimestamp2.default);
SectionSchema.index({
  createdAt: 1,
  updatedAt: 1
});

const Section = exports.Section = _mongoose2.default.model('Section', SectionSchema);

const SectionTC = exports.SectionTC = (0, _graphqlComposeMongoose.composeWithMongoose)(Section);
SectionTC.addRelation('user', {
  resolver: () => _.UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: source => ({
      id: source._id
    })
  },
  projection: {
    id: true
  }
});
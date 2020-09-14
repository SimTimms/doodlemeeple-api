"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SectionTC = exports.Section = exports.SectionSchema = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongooseTimestamp = _interopRequireDefault(require("mongoose-timestamp"));

var _graphqlComposeMongoose = require("graphql-compose-mongoose");

var _ = require("./");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const SectionSchema = new _mongoose.Schema({
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
  },
  gallery: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Gallery'
  },
  notableProjects: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'NotableProject'
  }],
  testimonials: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Testimonial'
  }]
}, {
  collection: 'sections'
});
exports.SectionSchema = SectionSchema;
SectionSchema.plugin(_mongooseTimestamp.default);
SectionSchema.index({
  createdAt: 1,
  updatedAt: 1
});

const Section = _mongoose.default.model('Section', SectionSchema);

exports.Section = Section;
const SectionTC = (0, _graphqlComposeMongoose.composeWithMongoose)(Section);
exports.SectionTC = SectionTC;
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
SectionTC.addRelation('gallery', {
  resolver: () => _.GalleryTC.getResolver('findOne'),
  prepareArgs: {
    filter: ({
      gallery
    }) => {
      return {
        _id: gallery
      };
    }
  },
  projection: {
    gallery: true,
    _id: true
  }
});
SectionTC.addRelation('notableProjects', {
  resolver: () => _.NotableProjectTC.getResolver('findMany'),
  prepareArgs: {
    filter: source => ({
      section: source._id
    })
  },
  projection: {
    id: true
  }
});
SectionTC.addRelation('testimonials', {
  resolver: () => _.TestimonialTC.getResolver('findMany'),
  prepareArgs: {
    filter: source => ({
      section: source._id
    })
  },
  projection: {
    id: true
  }
});
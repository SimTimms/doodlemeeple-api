"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationTC = exports.Notification = exports.NotificationSchema = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongooseTimestamp = _interopRequireDefault(require("mongoose-timestamp"));

var _graphqlComposeMongoose = require("graphql-compose-mongoose");

var _ = require("./");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const NotificationSchema = new _mongoose.Schema({
  title: {
    type: String
  },
  message: {
    type: String
  },
  linkTo: {
    type: String
  },
  icon: {
    type: String
  },
  discarded: {
    type: Boolean
  },
  user: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  collection: 'notifications'
});
exports.NotificationSchema = NotificationSchema;
NotificationSchema.plugin(_mongooseTimestamp.default);
NotificationSchema.index({
  createdAt: 1,
  updatedAt: 1
});

const Notification = _mongoose.default.model('Notification', NotificationSchema);

exports.Notification = Notification;
const NotificationTC = (0, _graphqlComposeMongoose.composeWithMongoose)(Notification);
exports.NotificationTC = NotificationTC;
NotificationTC.addRelation('user', {
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
NotificationTC.addResolver({
  name: 'notificationSecure',
  args: {},
  type: [NotificationTC],
  kind: 'query',
  resolve: async rp => {
    const userId = (0, _utils.getUserId)(rp.context.headers.authorization);
    const newNotifications = await Notification.find({
      user: userId
    }).sort({
      createdAt: -1
    }).limit(10);
    return newNotifications;
  }
});
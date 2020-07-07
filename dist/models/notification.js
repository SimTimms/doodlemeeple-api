"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationTC = exports.Notification = exports.NotificationSchema = undefined;

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseTimestamp = require("mongoose-timestamp");

var _mongooseTimestamp2 = _interopRequireDefault(_mongooseTimestamp);

var _graphqlComposeMongoose = require("graphql-compose-mongoose");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NotificationSchema = exports.NotificationSchema = new _mongoose.Schema({
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
  }
}, {
  collection: 'notifications'
});
NotificationSchema.plugin(_mongooseTimestamp2.default);
NotificationSchema.index({
  createdAt: 1,
  updatedAt: 1
});

const Notification = exports.Notification = _mongoose2.default.model('Notification', NotificationSchema);

const NotificationTC = exports.NotificationTC = (0, _graphqlComposeMongoose.composeWithMongoose)(Notification);
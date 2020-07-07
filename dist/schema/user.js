"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserMutation = exports.UserQuery = undefined;

var _models = require("../models");

var _resolvers = require("../resolvers");

var _notifications = require("../utils/notifications");

var _utils = require("../utils");

const UserQuery = {
  userById: _models.UserTC.getResolver('findById'),
  userByIds: _models.UserTC.getResolver('findByIds'),
  userOne: _models.UserTC.getResolver('findOne'),
  userMany: _models.UserTC.getResolver('findMany'),
  userCount: _models.UserTC.getResolver('count'),
  userConnection: _models.UserTC.getResolver('connection'),
  userPagination: _models.UserTC.getResolver('pagination')
};
const UserMutation = {
  userCreateOne: _models.UserTC.getResolver('createOne').wrapResolve(next => async rp => {
    const updatedUser = await (0, _resolvers.userRegistration)(rp);
    const newUser = await next(updatedUser);
    (0, _utils.createNotification)(_notifications.REGISTRATION, newUser._id);
    return newUser;
  }),
  userCreateMany: _models.UserTC.getResolver('createMany'),
  userUpdateById: _models.UserTC.getResolver('updateById'),
  userUpdateOne: _models.UserTC.getResolver('updateOne'),
  userUpdateMany: _models.UserTC.getResolver('updateMany'),
  userRemoveById: _models.UserTC.getResolver('removeById'),
  userRemoveOne: _models.UserTC.getResolver('removeOne'),
  userRemoveMany: _models.UserTC.getResolver('removeMany')
};
exports.UserQuery = UserQuery;
exports.UserMutation = UserMutation;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserMutation = exports.UserQuery = void 0;

var _models = require("../models");

var _resolversNew = require("../resolversNew");

var _notifications = require("../utils/notifications");

var _utils = require("../utils");

const UserQuery = {
  userById: _models.UserTC.getResolver('findById'),
  userByIds: _models.UserTC.getResolver('findByIds'),
  userOne: _models.UserTC.getResolver('findOne'),
  userMany: _models.UserTC.getResolver('findMany'),
  userCount: _models.UserTC.getResolver('count'),
  userConnection: _models.UserTC.getResolver('connection'),
  userPagination: _models.UserTC.getResolver('pagination'),
  profile: _models.UserTC.getResolver('profile'),
  getCreatives: _models.UserTC.getResolver('getCreatives')
};
exports.UserQuery = UserQuery;
const UserMutation = {
  userCreateOne: _models.UserTC.getResolver('createOne').wrapResolve(next => async rp => {
    const updatedUser = await (0, _resolversNew.userRegistration)(rp);
    const newUser = await next(updatedUser);
    await _models.Notification.create({ ..._notifications.CREATE_JOB,
      user: newUser.recordId
    });
    await _models.Notification.create({ ..._notifications.REGISTRATION,
      user: newUser.recordId
    });
    return newUser;
  }),
  deleteAccount: _models.UserTC.getResolver('deleteAccount'),
  userCreateMany: _models.UserTC.getResolver('createMany'),
  userUpdateById: _models.UserTC.getResolver('updateById'),
  userUpdateOne: _models.UserTC.getResolver('updateOne').wrapResolve(next => async rp => {
    const userId = (0, _utils.getUserId)(rp.context.headers.authorization);
    const UpdatedUser = await _models.User.findByIdAndUpdate({
      _id: userId
    }, { ...rp.args.record
    });
    return UpdatedUser;
  }),
  userUpdateMany: _models.UserTC.getResolver('updateMany'),
  userRemoveById: _models.UserTC.getResolver('removeById'),
  userRemoveOne: _models.UserTC.getResolver('removeOne'),
  userRemoveMany: _models.UserTC.getResolver('removeMany'),
  userLogin: _models.UserTC.getResolver('login'),
  userMigrate: _models.UserTC.getResolver('userMigrate'),
  updateProfile: _models.UserTC.getResolver('updateProfile')
};
exports.UserMutation = UserMutation;
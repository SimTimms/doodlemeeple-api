"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SectionMutation = exports.SectionQuery = void 0;

var _models = require("../models");

var _utils = require("../utils");

const SectionQuery = {
  sectionById: _models.SectionTC.getResolver('findById'),
  sectionByIds: _models.SectionTC.getResolver('findByIds'),
  sectionOne: _models.SectionTC.getResolver('findOne'),
  sectionMany: _models.SectionTC.getResolver('findMany'),
  sectionCount: _models.SectionTC.getResolver('count'),
  sectionConnection: _models.SectionTC.getResolver('connection'),
  sectionPagination: _models.SectionTC.getResolver('pagination')
};
exports.SectionQuery = SectionQuery;
const SectionMutation = {
  sectionCreateOne: _models.SectionTC.getResolver('createOne').wrapResolve(next => async rp => {
    const userId = (0, _utils.getUserId)(rp.context.headers.authorization);
    rp.args.record.user = userId;
    const gallery = await _models.Gallery.create({});
    rp.args.record.gallery = gallery._id;
    const section = await next(rp);
    await _models.User.updateOne({
      _id: userId
    }, {
      $push: {
        sections: section.recordId
      }
    });
    return section;
  }),
  sectionCreateMany: _models.SectionTC.getResolver('createMany'),
  sectionUpdateById: _models.SectionTC.getResolver('updateById'),
  sectionUpdateOne: _models.SectionTC.getResolver('updateOne'),
  sectionUpdateMany: _models.SectionTC.getResolver('updateMany'),
  sectionRemoveById: _models.SectionTC.getResolver('removeById'),
  sectionRemoveOne: _models.SectionTC.getResolver('removeOne'),
  sectionRemoveMany: _models.SectionTC.getResolver('removeMany')
};
exports.SectionMutation = SectionMutation;
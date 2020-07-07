"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SectionMutation = exports.SectionQuery = undefined;

var _models = require("../models");

const SectionQuery = {
  sectionById: _models.SectionTC.getResolver('findById'),
  sectionByIds: _models.SectionTC.getResolver('findByIds'),
  sectionOne: _models.SectionTC.getResolver('findOne'),
  sectionMany: _models.SectionTC.getResolver('findMany'),
  sectionCount: _models.SectionTC.getResolver('count'),
  sectionConnection: _models.SectionTC.getResolver('connection'),
  sectionPagination: _models.SectionTC.getResolver('pagination')
};
const SectionMutation = {
  sectionCreateOne: _models.SectionTC.getResolver('createOne'),
  sectionCreateMany: _models.SectionTC.getResolver('createMany'),
  sectionUpdateById: _models.SectionTC.getResolver('updateById'),
  sectionUpdateOne: _models.SectionTC.getResolver('updateOne'),
  sectionUpdateMany: _models.SectionTC.getResolver('updateMany'),
  sectionRemoveById: _models.SectionTC.getResolver('removeById'),
  sectionRemoveOne: _models.SectionTC.getResolver('removeOne'),
  sectionRemoveMany: _models.SectionTC.getResolver('removeMany')
};
exports.SectionQuery = SectionQuery;
exports.SectionMutation = SectionMutation;
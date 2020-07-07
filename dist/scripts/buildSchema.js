"use strict";

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _graphql = require("graphql");

var _utilities = require("graphql/utilities");

var _schema = require("../schema");

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function buildSchema() {
  await _fsExtra2.default.ensureFile('../data/schema.graphql.json');
  await _fsExtra2.default.ensureFile('../data/schema.graphql');

  _fsExtra2.default.writeFileSync(_path2.default.join(__dirname, '../data/schema.graphql.json'), JSON.stringify(await (0, _graphql.graphql)(_schema2.default, _utilities.introspectionQuery), null, 2));

  _fsExtra2.default.writeFileSync(_path2.default.join(__dirname, '../data/schema.graphql.txt'), (0, _utilities.printSchema)(_schema2.default));
}

async function run() {
  await buildSchema();
  console.log('Schema build complete!');
}

run().catch(e => {
  console.log(e);
  process.exit(0);
});
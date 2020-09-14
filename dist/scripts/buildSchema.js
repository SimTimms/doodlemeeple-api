"use strict";

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _graphql = require("graphql");

var _utilities = require("graphql/utilities");

var _schema = _interopRequireDefault(require("../schema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function buildSchema() {
  await _fsExtra.default.ensureFile('../data/schema.graphql.json');
  await _fsExtra.default.ensureFile('../data/schema.graphql');

  _fsExtra.default.writeFileSync(_path.default.join(__dirname, '../data/schema.graphql.json'), JSON.stringify(await (0, _graphql.graphql)(_schema.default, _utilities.introspectionQuery), null, 2));

  _fsExtra.default.writeFileSync(_path.default.join(__dirname, '../data/schema.graphql.txt'), (0, _utilities.printSchema)(_schema.default));
}

async function run() {
  await buildSchema();
  console.log('Schema build complete!');
}

run().catch(e => {
  console.log(e);
  process.exit(0);
});
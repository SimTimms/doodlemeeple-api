"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

_mongoose2.default.Promise = global.Promise;

const connection = _mongoose2.default.connect(process.env.MONGODB_URI, {
  autoIndex: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  poolSize: 50,
  bufferMaxEntries: 0,
  keepAlive: 120,
  useNewUrlParser: true
});

_mongoose2.default.set('useCreateIndex', true);

connection.then(db => db).catch(err => {
  console.log(err);
});
exports.default = connection;
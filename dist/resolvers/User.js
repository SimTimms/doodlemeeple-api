"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userRegistration = userRegistration;

var _utils = require("../utils");

var _bcryptjs = require("bcryptjs");

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  emailSignup
} = require('../email');

async function userRegistration(rp) {
  const {
    password,
    email,
    name
  } = rp.args.record;
  const validSubmission = (0, _utils.signupChecks)({
    password,
    name,
    email
  });

  if (validSubmission === false) {
    throw new Error('Submission Failed');
  }

  const passwordEncrypted = await _bcryptjs2.default.hash(password, 10);
  rp.args.record.password = passwordEncrypted;
  const request = emailSignup(email, name);
  request.then(result => {}).catch(err => {
    console.log(err.statusCode);
  });
  return rp;
}
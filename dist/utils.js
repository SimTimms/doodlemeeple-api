"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserId = getUserId;
exports.getUserIdWithoutContext = getUserIdWithoutContext;
exports.signupChecks = signupChecks;
exports.profileCheck = profileCheck;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _passwordValidator = _interopRequireDefault(require("password-validator"));

var _emailValidator = _interopRequireDefault(require("email-validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getUserId(auth) {
  if (auth) {
    const token = auth.replace('Bearer ', '');

    const {
      userId
    } = _jsonwebtoken.default.verify(token, process.env.APP_SECRET);

    return userId;
  }

  throw new Error('Not authenticated');
}

function getUserIdWithoutContext(headers) {
  const Authorization = headers.Authorization;

  if (Authorization) {
    const token = Authorization.replace('Bearer ', ''); // @ts-ignore

    const {
      userId
    } = _jsonwebtoken.default.verify(token, process.env.APP_SECRET);

    return userId;
  }

  throw new Error('Not authenticated');
}

function signupChecks(input) {
  let passwordSchema = new _passwordValidator.default();
  passwordSchema.is().min(6) // Minimum length 8
  .is().max(22) // Maximum length 100
  .has().uppercase() // Must have uppercase letters
  .has().lowercase() // Must have lowercase letters
  .has().digits() // Must have digits
  .has().not().spaces() // Should not have spaces
  .is().not().oneOf(['Passw0rd', 'Password123']);

  if (input.name.length < 3) {
    return false;
  }

  if (input.name.length > 32) {
    return false;
  }

  if (_emailValidator.default.validate(input.name.email)) {
    return false;
  }

  if (!passwordSchema.validate(input.password)) {
    return false;
  }

  return true;
}

function profileCheck(input) {
  if (input.name.length < 3) {
    return false;
  }

  if (input.name.length > 32) {
    return false;
  }

  return true;
}
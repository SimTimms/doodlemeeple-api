"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNotification = createNotification;
exports.getUserId = getUserId;
exports.getUserIdWithoutContext = getUserIdWithoutContext;
exports.signupChecks = signupChecks;
exports.profileCheck = profileCheck;

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _passwordValidator = require("password-validator");

var _passwordValidator2 = _interopRequireDefault(_passwordValidator);

var _emailValidator = require("email-validator");

var _emailValidator2 = _interopRequireDefault(_emailValidator);

var _models = require("./models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const APP_SECRET = 'GraphQL-is-aw3some';

async function createNotification(message, userId) {
  /*
  const exists = await context.prisma.$exists.notification({
    user: { id: userId },
    title: message.title,
  });
   !exists &&
    (await context.prisma.createNotification({
      user: { connect: { id: userId } },
      title: message.title,
      message: message.message,
      linkTo: message.linkTo,
      icon: message.icon,
    }));
  */
  return true;
}

function getUserId(context) {
  const Authorization = context.request.get('Authorization');

  if (Authorization) {
    const token = Authorization.replace('Bearer ', ''); // @ts-ignore

    const {
      userId
    } = _jsonwebtoken2.default.verify(token, APP_SECRET);

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
    } = _jsonwebtoken2.default.verify(token, APP_SECRET);

    return userId;
  }

  throw new Error('Not authenticated');
}

function signupChecks(input) {
  let passwordSchema = new _passwordValidator2.default();
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

  if (_emailValidator2.default.validate(input.name.email)) {
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
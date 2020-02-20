const jwt = require('jsonwebtoken');
const APP_SECRET = 'GraphQL-is-aw3some';
var passwordValidator = require('password-validator');
var validator = require('email-validator');

function getUserId(context) {
  const Authorization = context.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');

    // @ts-ignore
    const { userId } = jwt.verify(token, APP_SECRET);

    return userId;
  }

  throw new Error('Not authenticated');
}

function signupChecks(input) {
  let passwordSchema = new passwordValidator();
  passwordSchema
    .is()
    .min(6) // Minimum length 8
    .is()
    .max(22) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .not()
    .spaces() // Should not have spaces
    .is()
    .not()
    .oneOf(['Passw0rd', 'Password123']);

  if (input.name.length < 3) {
    return false;
  }

  if (validator.validate(input.name.email)) {
    return false;
  }

  if (!passwordSchema.validate(input.password)) {
    return false;
  }

  return true;
}

module.exports = {
  APP_SECRET,
  getUserId,
  signupChecks,
};

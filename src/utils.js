import jwt from 'jsonwebtoken';
import passwordValidator from 'password-validator';
import validator from 'email-validator';

export function getUserId(auth) {
  if (auth) {
    const token = auth.replace('Bearer ', '');
    const { userId } = jwt.verify(token, process.env.APP_SECRET);

    return userId;
  }

  return null;
}

export function getUserIdWithoutContext(Authorization) {
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');

    // @ts-ignore
    const { userId } = jwt.verify(token, process.env.APP_SECRET);

    return userId;
  }

  return null;
}

export function signupChecks(input) {
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
  if (input.name.length > 32) {
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

export function profileCheck(input) {
  if (input.name.length < 3) {
    return false;
  }
  if (input.name.length > 32) {
    return false;
  }

  return true;
}

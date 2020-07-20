import { signupChecks } from '../utils';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
const { emailSignup } = require('../email');

export async function userRegistration(rp) {
  const { password, email, name } = rp.args.record;
  const validSubmission = signupChecks({
    password,
    name,
    email,
  });

  if (validSubmission === false) {
    throw new Error('Submission Failed');
  }
  const passwordEncrypted = await bcrypt.hash(password, 10);
  rp.args.record.password = passwordEncrypted;

  const request = emailSignup(email, name);
  request
    .then((result) => {})
    .catch((err) => {
      console.log(err.statusCode);
    });

  return rp;
}

export async function login(args) {
  console.log('sad');
  const user = await User.findOne(
    {
      email: args.email,
    },
    { email: 1, password: 1, token: 1 }
  );

  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }
  const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
  user.token = token;
  return user;
}

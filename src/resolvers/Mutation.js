const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  APP_SECRET,
  getUserId,
  signupChecks,
  profileCheck,
} = require('../utils');
const sgMail = require('@sendgrid/mail');
const { updateGallerySection, updateSection } = require('./mutations/section');
import { emailAddress } from '../utils/emailAddress';

async function removeSection(parent, args, context) {
  await context.prisma.deleteSection({
    id: args.id,
  });

  return true;
}

async function removeNotification(parent, args, context) {
  await context.prisma.deleteNotification({
    id: args.id,
  });

  return true;
}

async function updateUser(parent, args, context, info) {
  const validSubmission = profileCheck({
    name: args.name,
    summary: args.summary,
  });

  if (validSubmission === false) {
    throw new Error('Submission Failed');
  }

  const userId = getUserId(context);

  await context.prisma.createNotification({
    user: { connect: { id: userId } },
    title: 'You updated your profile',
    message: 'Nice Work! Keep your profile up-to-date',
    linkTo: '/edit-profile',
    icon: 'contact_mail',
  });

  const user = await context.prisma.updateUser({
    data: {
      name: args.name,
      summary: args.summary,
      profileBG: args.profileBG,
      profileImg: args.profileImg,
    },
    where: {
      id: userId,
    },
  });

  return user;
}

async function passwordForgot(parent, args, context) {
  const user = await context.prisma.user({
    email: args.email,
  });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  await context.prisma.updateUser({
    data: {
      resetToken: token,
    },
    where: {
      id: user.id,
    },
  });

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const actionLink = `${process.env.EMAIL_URL}/password-reset/${token}`;
  const msg = {
    to: args.email,
    from: emailAddress.noreply,
    subject: 'Reset your DoodleMeeple password',
    text: `You have requested a password reset, please go to: ${actionLink}. If this was not you contact ${emailAddress.tech}. ${emailAddress.signoffPain}`,
    html: `<p>Hi,</p><p>You have requested a password reset, please click this link to continue: </p><p><strong><br/><a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${actionLink}'>Reset My Password</a><br/><br/></strong></p><p>${emailAddress.signoffHTML}</p><p style="font-size:10px">If this was not you contact <a href='${emailAddress.tech}'>${emailAddress.tech}</a></p>`,
  };
  await sgMail.send(msg);

  return true;
}

async function passwordReset(parent, args, context) {
  const user = await context.prisma.user({
    resetToken: args.token,
  });

  const validSubmission = signupChecks({
    password: args.password,
    name: user.name,
    email: user.email,
  });

  if (validSubmission === false) {
    throw new Error('Submission Failed');
  }

  const password = await bcrypt.hash(args.password, 10);

  await context.prisma.updateUser({
    data: {
      resetToken: null,
      password: password,
    },
    where: {
      id: user.id,
    },
  });

  if (user) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const actionLink = `${process.env.EMAIL_URL}`;
    const msg = {
      to: user.email,
      from: 'account@doodlemeeple.com',
      subject: 'Password has been changed',
      text: `Your password has been changed, visit ${actionLink}`,
      html: `<strong>Your password has been changed, visit <a href='${actionLink}'>${actionLink}</a></strong>`,
    };
    await sgMail.send(msg);

    return true;
  } else {
    return false;
  }
}

async function signup(parent, args, context, info) {
  const validSubmission = signupChecks({
    password: args.password,
    name: args.name,
    email: args.email,
  });

  if (validSubmission === false) {
    throw new Error('Submission Failed');
  }

  const password = await bcrypt.hash(args.password, 10);

  try {
    const user = await context.prisma.createUser({ ...args, password });
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: 'welcome@doodlemeeple.com',
      subject: 'Welcome to DoodleMeeple',
      text: 'Welcome to DoodleMeeple',
      html: '<strong>Welcome to DoodleMeeple</strong>',
    };
    sgMail.send(msg);

    await context.prisma.createNotification({
      user: { connect: { id: user.id } },
      title: 'Welcome to DoodleMeeple',
      message: 'Get started by creating a profile',
      linkTo: 'edit-profile',
      icon: 'contact_mail',
    });

    return {
      token,
      user,
    };
  } catch (error) {
    throw new Error(error);
  }
}

function createNotification(parent, args, context) {
  const userId = getUserId(context);

  return context.prisma.createNotification({
    user: { connect: { id: userId } },
    message: args.message,
  });
}

async function login(parent, args, context, info) {
  // 1
  const user = await context.prisma.user({ email: args.email });
  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  // 3
  return {
    token,
    user,
  };
}

module.exports = {
  signup,
  passwordForgot,
  passwordReset,
  updateUser,
  updateSection,
  updateGallerySection,
  removeSection,
  createNotification,
  removeNotification,
  login,
};

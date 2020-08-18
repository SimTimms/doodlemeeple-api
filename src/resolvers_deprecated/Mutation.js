const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { emailReset, emailForgot, emailSignup } = require('../email');
const {
  APP_SECRET,
  getUserId,
  signupChecks,
  profileCheck,
} = require('../utils');
const {
  updateGallerySection,
  createGallerySection,
  updateSection,
  updateTestimonial,
  createTestimonial,
  updateProject,
  createProject,
} = require('./mutations/section');
const { addFavourite } = require('./mutations/favourites');
const { updateGame, createGame, removeGame } = require('./mutations/game');
const {
  createMessage,
  updateMessage,
  removeMessage,
  markAsRead,
} = require('./mutations/message');
const {
  updateJob,
  createJob,
  removeJob,
  submitBrief,
} = require('./mutations/job');
const {
  updateInvite,
  createInvite,
  removeInvite,
  declineInvite,
} = require('./mutations/invite');
const {
  updateContract,
  createContract,
  removeContract,
  submitContract,
  signContract,
  declineContract,
} = require('./mutations/contract');
const {
  updatePaymentTerm,
  createPaymentTerm,
  removePaymentTerm,
} = require('./mutations/paymentTerm');
var validator = require('email-validator');
const { emailAddress } = require('../utils/emailAddress');
var aws = require('aws-sdk');
require('dotenv').config();
const { getSections, getGalleries, getImages } = require('./Query');
const stripe = require('stripe')(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02',
});
aws.config.update({
  region: 'eu-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const S3_BUCKET = process.env.BUCKET;
var s3 = new aws.S3();
//DANGER!!! Don't f*ck around with this one
async function deleteAccount(parent, args, context, info) {
  const userId = getUserId(context);

  const sections = await getSections(parent, args, context);
  const galleries = await getGalleries(
    parent,
    { sectionId: sections.map((item) => item.id) },
    context
  );
  const images = await getImages(
    parent,
    { galleryId: galleries.map((item) => item.id) },
    context
  );

  images.map((image) => {
    var params = {
      Bucket: S3_BUCKET,
      Key: image.img.replace('https://dm-uploads-uk.s3.amazonaws.com/', ''),
    };
    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);
      // error
      else console.log('deleted'); // deleted
    });
  });

  await context.prisma.deleteUser({ id: userId });
}

async function makePayment(parent, args, context) {
  const userId = getUserId(context);
  const { currency, amount, contractId } = args;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: currency.toLowerCase() || 'gbp',
    metadata: { integration_check: 'accept_a_payment' },
  });
  await context.prisma.createPayment({
    amount: amount * 100,
    currency: currency,
    status: 'Incomplete',
    paidBy: { connect: { id: userId } },
    contract: { connect: { id: contractId } },
    paymentId: paymentIntent.id,
  });

  return paymentIntent.client_secret;
}

async function removeSection(parent, args, context) {
  await context.prisma.deleteSection({
    id: args.id,
  });

  return true;
}

async function removeNotableProject(parent, args, context) {
  await context.prisma.deleteNotableProjects({
    id: args.id,
  });

  return true;
}

async function removeTestimonial(parent, args, context) {
  await context.prisma.deleteTestimonial({
    id: args.id,
  });

  return true;
}

async function removeNotification(parent, args, context) {
  await context.prisma.deleteNotification({
    id: args.id,
  });

  const userId = getUserId(context);

  const notifications = await context.prisma.notifications({
    orderBy: 'createdAt_DESC',
    where: {
      user: {
        id: userId,
      },
    },
    skip: 0,
    first: 5,
  });

  return notifications;
}

async function updateEmail(parent, args, context, info) {
  const validSubmission = validator.validate(args.email);

  if (validSubmission === false) {
    throw new Error('Invalid Email');
  }

  const userId = getUserId(context);

  const exists = await context.prisma.$exists.notification({
    user: { id: userId },
    title: 'You changed your email address',
  });

  !exists &&
    (await context.prisma.createNotification({
      user: { connect: { id: userId } },
      title: 'You changed your email address',
      message: `If this wasn't you, let us know`,
      linkTo: '/app/edit-profile',
      icon: 'email',
    }));

  const emailExists = await context.prisma.$exists.user({
    user: { id_not: userId },
    email: args.email,
  });
  if (emailExists) {
    throw new Error('Invalid Email');
  }
  await context.prisma.updateUser({
    data: {
      email: args.email,
    },
    where: {
      id: userId,
    },
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

  const user = await context.prisma.updateUser({
    data: {
      name: args.name.replace(/[^A-Za-z0-9 ]/g, ''),
      summary: args.summary.replace(/[^A-Za-z0-9 .,\'\n]/g, ''),
      profileBG: args.profileBG,
      profileBGStyle: args.profileBGStyle,
      profileImg: args.profileImg,
      profileImgStyle: args.profileImgStyle,
      autosave: args.autosave,
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
  const actionLink = `${process.env.EMAIL_URL}/password-reset/${token}`;
  const request = emailForgot(user, actionLink);

  request
    .then((result) => {})
    .catch((err) => {
      console.log(err.statusCode);
    });

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
    const actionLink = `${process.env.EMAIL_URL}`;
    const request = emailReset(user, actionLink);

    request
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err.statusCode);
      });

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
    const user = await context.prisma.createUser({
      ...args,
      password,
      summary: '',
    });
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    const request = emailSignup(args);
    request
      .then((result) => {
        console.log(result.body);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.statusCode);
      });

    await context.prisma.createNotification({
      user: { connect: { id: user.id } },
      title: 'Welcome to DoodleMeeple',
      message: 'Get started by creating a profile',
      linkTo: '/app/edit-profile',
      icon: 'thumb_up_alt',
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

async function login_dep(parent, args, context, info) {
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
  updateEmail,
  updateSection,
  updateGallerySection,
  createGallerySection,
  updateTestimonial,
  createTestimonial,
  updateProject,
  createProject,
  updateGame,
  createGame,
  removeGame,
  createMessage,
  updateMessage,
  removeMessage,
  updatePaymentTerm,
  createPaymentTerm,
  removePaymentTerm,
  markAsRead,
  updateJob,
  createJob,
  removeJob,
  submitBrief,
  updateInvite,
  createInvite,
  removeInvite,
  declineInvite,
  updateContract,
  createContract,
  removeContract,
  submitContract,
  signContract,
  declineContract,
  addFavourite,
  removeSection,
  createNotification,
  removeNotification,
  removeNotableProject,
  removeTestimonial,
  deleteAccount,
  login_dep,
  makePayment,
};

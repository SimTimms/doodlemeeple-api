const { getUserId } = require('../../../utils');
const { emailInvite } = require('../../../email');

async function submitBrief(parent, args, context, info) {
  const { jobId } = args;

  const jobDeets = await context.prisma.job({
    id: jobId,
  });

  await context.prisma.updateJob({
    data: {
      submitted: true,
    },
    where: {
      id: jobId,
    },
  });

  const emailAddresses = await context.prisma.users({
    where: {
      invites_some: { job: { id: jobId } },
    },
  });

  emailAddresses.map((email) => {
    console.log(email);
    const request = emailInvite(email, jobDeets);

    request
      .then((result) => {})
      .catch((err) => {
        console.log(err.statusCode);
      });
  });

  await context.prisma.updateManyInvites({
    data: {
      status: 'submitted',
    },
    where: {
      job: { id: jobId },
    },
  });

  return true;
}

async function updateJob(parent, args, context, info) {
  const {
    name,
    img,
    summary,
    location,
    showreel,
    creativeSummary,
    submitted,
  } = args.job;
  const returnObj = await context.prisma.updateJob({
    data: {
      name,
      img,
      summary,
      location,
      showreel,
      submitted,
      creativeSummary,
    },
    where: {
      id: args.id,
    },
  });

  return returnObj.id;
}

async function createJob(parent, args, context, info) {
  const userId = getUserId(context);
  const {
    name,
    img,
    summary,
    location,
    showreel,
    submitted,
    gameId,
    creativeSummary,
  } = args.job;

  const returnObj = await context.prisma.createJob({
    user: { connect: { id: userId } },
    name,
    img,
    summary,
    creativeSummary,
    submitted,
    location,
    showreel,
    game: { connect: { id: gameId } },
  });
  return returnObj.id;
}

async function removeJob(parent, args, context) {
  await context.prisma.deleteJob({
    id: args.id,
  });

  return true;
}

module.exports = {
  updateJob,
  createJob,
  removeJob,
  submitBrief,
};

const { getUserId } = require('../../../utils');

async function updateContract(parent, args, context, info) {
  const { notes, deadline, cost, currency, status } = args.contract;
  const returnObj = await context.prisma.updateContract({
    data: {
      notes,
      deadline,
      cost,
      currency,
      status,
    },
    where: {
      id: args.id,
    },
  });

  return returnObj.id;
}

async function submitContract(parent, args, context, info) {
  const { id } = args;
  const userId = getUserId(context);

  const returnObj = await context.prisma.updateManyContracts({
    data: {
      status: 'submitted',
    },
    where: {
      id: id,
      user: { id: userId },
    },
  });

  return returnObj.id;
}

async function createContract(parent, args, context, info) {
  const userId = getUserId(context);
  const {
    notes,
    deadline,
    cost,
    paymentTerms,
    currency,
    jobId,
  } = args.contract;

  //Update the status of all previous contracts to obsolete
  await context.prisma.updateManyContracts({
    data: {
      status: 'removed',
    },
    where: {
      user: { id: userId },
      job: { id: jobId },
    },
  });

  const returnObj = await context.prisma.createContract({
    notes,
    deadline,
    cost,
    currency,
    job: { connect: { id: jobId } },
    user: { connect: { id: userId } },
  });

  return returnObj.id;
}

async function removeContract(parent, args, context) {
  await context.prisma.deleteContract({
    id: args.id,
  });

  return true;
}

module.exports = {
  updateContract,
  createContract,
  removeContract,
  submitContract,
};

async function updateContract(parent, args, context, info) {
  const { inviteId } = args.contract;
  const returnObj = await context.prisma.updateContract({
    data: {
      ...args,
    },
    where: {
      invite: { id: inviteId },
    },
  });

  return returnObj.id;
}

async function createContract(parent, args, context, info) {
  const {
    notes,
    deadline,
    cost,
    paymentTerms,
    currency,
    inviteId,
  } = args.contract;

  const returnObj = await context.prisma.createContract({
    notes,
    deadline,
    cost,
    currency,
    invite: { connect: { id: inviteId } },
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
};

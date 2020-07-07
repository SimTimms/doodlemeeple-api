"use strict";

const {
  getUserId
} = require('../../../utils');

async function updatePaymentTerm(parent, args, context, info) {
  const {
    percent,
    description
  } = args.paymentTerm;
  const returnObj = await context.prisma.updatePaymentTerm({
    data: {
      percent,
      description
    },
    where: {
      id: args.id
    }
  });
  return returnObj.id;
}

async function createPaymentTerm(parent, args, context, info) {
  const {
    percent,
    description,
    contractId
  } = args.paymentTerm;
  const returnObj = await context.prisma.createPaymentTerm({
    percent,
    description,
    contract: {
      connect: {
        id: contractId
      }
    }
  });
  return returnObj.id;
}

async function removePaymentTerm(parent, args, context) {
  await context.prisma.deletePaymentTerm({
    id: args.id
  });
  return true;
}

module.exports = {
  updatePaymentTerm,
  createPaymentTerm,
  removePaymentTerm
};
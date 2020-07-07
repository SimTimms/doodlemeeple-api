"use strict";

const {
  getUserId
} = require('../../../utils');

const {
  CONTRACT_SUBMITTED
} = require('../../../utils/notifications');

const {
  createNotification
} = require('../utils');

const {
  emailQuote
} = require('../../../email');

async function updateContract(parent, args, context, info) {
  const {
    notes,
    deadline,
    cost,
    currency,
    status
  } = args.contract;
  const returnObj = await context.prisma.updateContract({
    data: {
      notes,
      deadline,
      cost,
      currency,
      status
    },
    where: {
      id: args.id
    }
  });
  return returnObj.id;
}

async function submitContract(parent, args, context, info) {
  const {
    id
  } = args;
  const userId = getUserId(context);
  const contract = await context.prisma.contract({
    id
  });
  const job = await context.prisma.contract({
    id
  }).job();
  const user = await context.prisma.job({
    id: job.id
  }).user();
  const returnObj = await context.prisma.updateManyContracts({
    data: {
      status: 'submitted'
    },
    where: {
      id: id,
      user: {
        id: userId
      }
    }
  });
  CONTRACT_SUBMITTED.linkTo = `${CONTRACT_SUBMITTED.linkTo}${id}`;
  createNotification(CONTRACT_SUBMITTED, user.id, context);
  const request = emailQuote(user, contract);
  request.then(result => {}).catch(err => {
    console.log(err.statusCode);
  });
  const conversation = await context.prisma.conversations({
    where: {
      job: {
        id: job.id
      },
      participants_some: {
        id_in: [userId]
      }
    }
  });
  await context.prisma.createMessage({
    sender: {
      connect: {
        id: userId
      }
    },
    messageStr: `QUOTE SUBMITTED:${contract.id}`,
    conversation: {
      connect: {
        id: conversation[0].id
      }
    },
    status: 'unread'
  });
  return returnObj.id;
}

async function signContract(parent, args, context, info) {
  const {
    contractId
  } = args;
  const userId = getUserId(context);
  const returnObj = await context.prisma.updateContract({
    data: {
      signedBy: {
        connect: {
          id: userId
        }
      },
      signedDate: new Date(),
      status: 'accepted'
    },
    where: {
      id: contractId
    }
  });
  return returnObj.id;
}

async function declineContract(parent, args, context, info) {
  const {
    contractId
  } = args;
  const userId = getUserId(context);
  const returnObj = await context.prisma.updateContract({
    data: {
      signedDate: new Date(),
      status: 'declined'
    },
    where: {
      id: contractId
    }
  });
  return returnObj.id;
}

async function createContract(parent, args, context, info) {
  const userId = getUserId(context);
  const {
    notes,
    deadline,
    cost,
    currency,
    jobId
  } = args.contract; //Update the status of all previous contracts to obsolete

  await context.prisma.updateManyContracts({
    data: {
      status: 'removed'
    },
    where: {
      user: {
        id: userId
      },
      job: {
        id: jobId
      }
    }
  });
  const returnObj = await context.prisma.createContract({
    notes,
    deadline,
    cost,
    currency,
    job: {
      connect: {
        id: jobId
      }
    },
    user: {
      connect: {
        id: userId
      }
    }
  });
  return returnObj.id;
}

async function removeContract(parent, args, context) {
  await context.prisma.deleteContract({
    id: args.id
  });
  return true;
}

module.exports = {
  updateContract,
  createContract,
  removeContract,
  submitContract,
  signContract,
  declineContract
};
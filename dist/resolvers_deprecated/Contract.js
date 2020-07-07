"use strict";

async function job(parent, args, context) {
  return await context.prisma.contract({
    id: parent.id
  }).job();
}

async function paymentTerms(parent, args, context) {
  return await context.prisma.contract({
    id: parent.id
  }).paymentTerms();
}

async function user(parent, args, context) {
  return await context.prisma.contract({
    id: parent.id
  }).user();
}

async function signedBy(parent, args, context) {
  return await context.prisma.contract({
    id: parent.id
  }).signedBy();
}

async function payments(parent, args, context) {
  return await context.prisma.contract({
    id: parent.id
  }).payments();
}

module.exports = {
  job,
  paymentTerms,
  user,
  signedBy,
  payments
};
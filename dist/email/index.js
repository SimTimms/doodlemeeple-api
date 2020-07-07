"use strict";

const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

const {
  emailAddress
} = require('../utils/emailAddress');

async function emailInvite(user, jobDeets) {
  const request = mailjet.post('send', {
    version: 'v3.1'
  }).request({
    Messages: [{
      From: {
        Email: emailAddress.noreply,
        Name: 'DoodleMeeple'
      },
      To: [{
        Email: user.email,
        Name: user.name
      }],
      Subject: `You've got an invite`,
      TextPart: `You have been asked to provide a quote for "${jobDeets.name}"`,
      HTMLPart: `<p>Hi ${user.name},</p>
        <p>You have been asked to provide a quote for "${jobDeets.name}"</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff;padding-bottom:30px;'>${jobDeets.summary}</p><p>Check in at <a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${emailAddress.appURL}'>DoodleMeeple</a></p><p>${emailAddress.signoffHTML}</p>
        `
    }]
  });
  return request;
}

async function emailQuote(user, quoteDeets) {
  const request = mailjet.post('send', {
    version: 'v3.1'
  }).request({
    Messages: [{
      From: {
        Email: emailAddress.noreply,
        Name: 'DoodleMeeple'
      },
      To: [{
        Email: user.email,
        Name: user.name
      }],
      Subject: `You've got an invite`,
      TextPart: `You have been asked to provide a quote for "${quoteDeets.name}"`,
      HTMLPart: `<p>Hi ${user.name},</p>
        <p>You have been asked to provide a quote for "${quoteDeets.summary}"</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff;padding-bottom:30px;'>${quoteDeets.cost}</p><p>Check in at <a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${emailAddress.appURL}'>DoodleMeeple</a></p><p>${emailAddress.signoffHTML}</p>
        `
    }]
  });
  return request;
}

async function emailNewMessage(user, subject) {
  const request = mailjet.post('send', {
    version: 'v3.1'
  }).request({
    Messages: [{
      From: {
        Email: emailAddress.noreply,
        Name: 'DoodleMeeple'
      },
      To: [{
        Email: user.email,
        Name: user.name
      }],
      Subject: subject,
      TextPart: `There's a message waiting for you on Doodle Meeple"`,
      HTMLPart: `<p>Hi ${user.name},</p>
        <p>There's a message waiting for you on Doodle Meeple!
        </p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center;'>1 New Message
        </p><p>Login at <a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${emailAddress.messagesURL}'>${emailAddress.messagesURL}</a></p><p>${emailAddress.signoffHTML}</p>
        `
    }]
  });
  return request;
}

async function emailForgot(user, actionLink) {
  const request = mailjet.post('send', {
    version: 'v3.1'
  }).request({
    Messages: [{
      From: {
        Email: emailAddress.noreply,
        Name: 'DoodleMeeple'
      },
      To: [{
        Email: user.email,
        Name: user.name
      }],
      Subject: 'Reset your DoodleMeeple password',
      TextPart: `You have requested a password reset, please go to: ${actionLink}. If this was not you contact ${emailAddress.tech}. ${emailAddress.signoffPain}`,
      HTMLPart: `<p>Hi,</p><p>You have requested a password reset, please click this link to continue: </p><p><strong><br/><a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${actionLink}'>Reset My Password</a><br/><br/></strong></p><p>${emailAddress.signoffHTML}</p><p style="font-size:10px">If this was not you contact <a href='${emailAddress.tech}'>${emailAddress.tech}</a></p>`
    }]
  });
  return request;
}

async function emailReset(user, actionLink) {
  const request = mailjet.post('send', {
    version: 'v3.1'
  }).request({
    Messages: [{
      From: {
        Email: emailAddress.noreply,
        Name: 'DoodleMeeple'
      },
      To: [{
        Email: user.email,
        Name: user.name
      }],
      Subject: 'Password has been changed',
      TextPart: `Your password has been changed, visit ${actionLink}`,
      HTMLPart: `<strong>Your password has been changed, visit <a href='${actionLink}'>${actionLink}</a></strong>`
    }]
  });
  return request;
}

async function emailSignup(email, name) {
  const request = mailjet.post('send', {
    version: 'v3.1'
  }).request({
    Messages: [{
      From: {
        Email: 'welcome@doodlemeeple.com',
        Name: 'DoodleMeeple'
      },
      To: [{
        Email: email,
        Name: name
      }],
      Subject: 'Welcome to DoodleMeeple',
      TextPart: `It's great to have you on board, login and set up your profile here: ${emailAddress.appURL}`,
      HTMLPart: `<p>Welcome to DoodleMeeple,</p><p>It's great to have you on board, login and create your profile here:</p><p><strong><br/><a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${emailAddress.appURL}'>Let's Begin</a><br/><br/></strong></p><p>${emailAddress.signoffHTML}</p><p style="font-size:10px">If this was not you contact <a href='${emailAddress.tech}'>${emailAddress.tech}</a></p>`
    }]
  });
  return request;
}

module.exports = {
  emailForgot,
  emailReset,
  emailSignup,
  emailInvite,
  emailNewMessage,
  emailQuote
};
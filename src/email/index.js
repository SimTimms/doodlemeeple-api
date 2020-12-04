const mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);
const { emailAddress } = require('../utils/emailAddress');

async function withdrawPaymentEmail(paymentDetails) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple Payments',
        },
        To: [
          {
            Email: paymentDetails.email,
            Name: paymentDetails.name,
          },
        ],
        Subject: `You've been paid!`,
        TextPart: `Your Client has paid: ${paymentDetails.amount} ${paymentDetails.currency}. Log into DoodleMeeple for more details`,
        HTMLPart: `<p>Hi ${paymentDetails.name},</p>
        <p>Your Client has paid ${paymentDetails.amount} ${paymentDetails.currency} into your STRIPE account.</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center;'>${paymentDetails.amount} ${paymentDetails.currency} </p><p>Check in at <a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${process.env.EMAIL_URL}'>DoodleMeeple</a></p><p>${emailAddress.signoffHTML}</p> `,
      },
    ],
  });
  return request;
}

async function withdrawFailedEmail(paymentDetails) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple Payments',
        },
        To: [
          {
            Email: paymentDetails.email,
            Name: paymentDetails.name,
          },
        ],
        Subject: `Payment Attempt Failed`,
        TextPart: `Your Client attempted to pay: ${paymentDetails.amount} ${paymentDetails.currency} into your STRIPE account but something went wrong. Please log into DoodleMeeple, go to ACCOUNT and re-connect your STRIPE account.`,
        HTMLPart: `<p>Hi ${paymentDetails.name},</p>
        <p>Your Client attempted to pay: ${paymentDetails.amount} ${paymentDetails.currency} into your STRIPE account but something went wrong.</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center;'>Please Re-connect your STRIPE account</p><p>Visit <a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${process.env.EMAIL_URL}'>DoodleMeeple</a> go to ACCOUNT and re-connect your STRIPE account.</p><p>${emailAddress.signoffHTML}</p> `,
      },
    ],
  });
  return request;
}

async function withdrawFailedEmailAdmin(paymentDetails) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple Payments',
        },
        To: [
          {
            Email: 'tim@doodlemeeple.com',
            Name: 'FAILED PAYMENT',
          },
        ],
        Subject: `Payment Attempt Failed`,
        TextPart: `Your Client attempted to pay: ${paymentDetails.amount} ${paymentDetails.currency} into your STRIPE account but something went wrong. Log into DoodleMeeple for more details.`,
        HTMLPart: `<p>Hi Payment Admin Person,</p>
        <p>Someone attempted to pay ${paymentDetails.amount} ${paymentDetails.currency} to ${paymentDetails.email}, but......THERE'S NO MONEY IN THE STRIPE ACCOUNT!!!! this is obviously bad. Fix it</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center;'>NO MONEY IN STRIPE ACCOUNT</p><p>${emailAddress.signoffHTML}</p> `,
      },
    ],
  });
  return request;
}

async function noStripeEmailAdmin({ name, email }) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple Payments',
        },
        To: [
          {
            Email: email,
            Name: 'FAILED PAYMENT',
          },
        ],
        Subject: `Payment Attempt Failed`,
        TextPart: `Hi ${name}, Your Client is unable to transfer a payment into your STRIPE account because it's not correctly setup. Please login to your stripe account and complete the verification process or email support@doodlemeeple.com for help.`,
        HTMLPart: `<p>Hi ${name}</p>
        <p>Your Client is unable to transfer a payment into your STRIPE account because it's not correctly setup. Please login to your stripe account and complete the verification process or email support@doodlemeeple.com for help.</p><p>${emailAddress.signoffHTML}</p> `,
      },
    ],
  });
  return request;
}

async function earlyClosure(creator, job) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple Payments',
        },
        To: [
          {
            Email: 'tim@doodlemeeple.com',
            Name: 'EARLY CLOSURE',
          },
        ],
        Subject: `Early Closure Request`,
        TextPart: `${creator.email} has request an early closure of: ${job.name} `,
        HTMLPart: `<p>Hi Payment Admin Person,</p>
        <p>${creator.email} has request an early closure of: ${job.name}</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center; '>EARLY CLOSURE</p><p>${emailAddress.signoffHTML}</p> `,
      },
    ],
  });
  return request;
}

async function emailInvite(user, jobDeets) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: `You've got an invite`,
        TextPart: `You have been asked to provide a quote for "${jobDeets.name}"`,
        HTMLPart: `<p>Hi ${user.name},</p>
        <p>You have been asked to provide a quote for "${jobDeets.name}"</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center;'>${jobDeets.summary}</p><p>Check in at <a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${process.env.EMAIL_URL}'>DoodleMeeple</a></p><p>${emailAddress.signoffHTML}</p>
        `,
      },
    ],
  });
  return request;
}

async function emailQuote(user, quoteDeets, sender) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: `${sender.name} has responded to your job on DoodleMeeple`,
        TextPart: `${sender.name} has responded to your job on DoodleMeeple: ${quoteDeets.cost} ${quoteDeets.currency}, ${quoteDeets.deadline}. View the full quote at ${emailAddress.appURL}. ${emailAddress.signoffHTML}`,
        HTMLPart: `<p>Hi ${user.name},</p>
        <p>${sender.name} has responded to your job on DoodleMeeple</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center; text-align:center'>${quoteDeets.cost} ${quoteDeets.currency}<br/>${quoteDeets.deadline}</p><p>View the full quote at <a style="border-radius:5px; padding:10px; color:#57499e; font-weight:bold; margin-top:10px; margin-bottom:10px;" href='${emailAddress.appURL}'>DoodleMeeple</a></p><p>${emailAddress.signoffHTML}</p>
        `,
      },
    ],
  });
  return request;
}

async function emailDeclineQuote(user, quoteDeets, sender) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: `${sender.name} has rejected your quote`,
        TextPart: `${sender.name} has rejected your quote on DoodleMeeple: View the full quote at ${emailAddress.appURL}. ${emailAddress.signoffHTML}`,
        HTMLPart: `<p>Hi ${user.name},</p>
        <p>${sender.name} has rejected your quote on DoodleMeeple</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center; text-align:center'>${quoteDeets.cost} ${quoteDeets.currency}<br/>${quoteDeets.deadline}<br/>REJECTED</p><p>View the full quote at <a style="border-radius:5px; padding:10px; color:#57499e; font-weight:bold; margin-top:10px; margin-bottom:10px;" href='${emailAddress.appURL}'>DoodleMeeple</a></p><p>${emailAddress.signoffHTML}</p>
        `,
      },
    ],
  });
  return request;
}

async function emailAcceptQuote(user, quoteDeets, sender) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: `${sender.name} has ACCEPTED your quote`,
        TextPart: `Congratulations, ${sender.name} has ACCEPTED your quote on DoodleMeeple: View the full quote at ${emailAddress.appURL}. ${emailAddress.signoffHTML}`,
        HTMLPart: `<p>Hi ${user.name},</p>
        <p>Congratulations, ${sender.name} has ACCEPTED your quote on DoodleMeeple</p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center; text-align:center'>${quoteDeets.cost} ${quoteDeets.currency}<br/>${quoteDeets.deadline}<br/>ACCEPTED</p><p>We'll let you know as soon as the Client has deposited the payment.</p><p>View the full quote at <a style="border-radius:5px; padding:10px; color:#57499e; font-weight:bold; margin-top:10px; margin-bottom:10px;" href='${emailAddress.appURL}'>DoodleMeeple</a></p><p>${emailAddress.signoffHTML}</p>
        `,
      },
    ],
  });
  return request;
}

async function emailNewMessage(user, subject) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: subject,
        TextPart: `There's a message waiting for you on Doodle Meeple"`,
        HTMLPart: `<p>Hi ${user.name},</p>
        <p>There's a message waiting for you on Doodle Meeple!
        </p><p style='background:#57499e; padding:20px; border-radius:5px; font-size:20px; color:#fff; text-align:center; text-align:center;'>1 New Message
        </p><p>Login at <a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${emailAddress.messagesURL}'>${emailAddress.messagesURL}</a></p><p>${emailAddress.signoffHTML}</p>
        `,
      },
    ],
  });
  return request;
}

async function emailForgot(user, actionLink) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: 'Reset your DoodleMeeple password',
        TextPart: `You have requested a password reset, please go to: ${actionLink}. If this was not you contact ${emailAddress.tech}. ${emailAddress.signoffPain}`,
        HTMLPart: `<p>Hi,</p><p>You have requested a password reset, please click this link to continue: </p><p><strong><br/><a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${actionLink}'>Reset My Password</a><br/><br/></strong></p><p>${emailAddress.signoffHTML}</p><p style="font-size:10px">If this was not you contact <a href='${emailAddress.tech}'>${emailAddress.tech}</a></p>`,
      },
    ],
  });
  return request;
}

async function emailReset(user, actionLink) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: emailAddress.noreply,
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: 'Password has been changed',
        TextPart: `Your password has been changed, visit ${actionLink}`,
        HTMLPart: `<strong>Your password has been changed, visit <a href='${actionLink}'>${actionLink}</a></strong>`,
      },
    ],
  });
  return request;
}

async function emailSignup(email, name) {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'welcome@doodlemeeple.com',
          Name: 'DoodleMeeple',
        },
        To: [
          {
            Email: email,
            Name: name,
          },
        ],
        Subject: 'Welcome to DoodleMeeple',
        TextPart: `It's great to have you on board, login and set up your profile here: ${emailAddress.appURL}`,
        HTMLPart: `<p>Welcome to DoodleMeeple,</p><p>It's great to have you on board, login and create your profile here:</p><p><strong><br/><a style="background:#ddd; border-radius:5px; text-decoration:none; padding:10px; color:#444; margin-top:10px; margin-bottom:10px;" href='${emailAddress.appURL}'>Let's Begin</a><br/><br/></strong></p><p>${emailAddress.signoffHTML}</p><p style="font-size:10px">If this was not you contact <a href='${emailAddress.tech}'>${emailAddress.tech}</a></p>`,
      },
    ],
  });
  return request;
}

module.exports = {
  emailForgot,
  emailReset,
  emailSignup,
  emailInvite,
  emailNewMessage,
  emailQuote,
  emailDeclineQuote,
  emailAcceptQuote,
  withdrawPaymentEmail,
  withdrawFailedEmail,
  withdrawFailedEmailAdmin,
  earlyClosure,
  noStripeEmailAdmin,
};

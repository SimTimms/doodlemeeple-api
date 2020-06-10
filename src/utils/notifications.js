const UPDATED_PROFILE = {
  title: 'You updated a gallery',
  message: 'Make sure you showcase your best work',
  linkTo: '/app/edit-profile',
  icon: 'insert_photo',
};

const CONTRACT_SUBMITTED = {
  title: `You've got a Quote`,
  message: 'Check it our',
  linkTo: '/app/view-contract/',
  icon: 'send',
};

const INVITED = {
  title: `You've been invited`,
  message: '',
  linkTo: '/app/invites',
  icon: 'thumb_up',
};

const MESSAGE_SENT = {
  title: `New Message`,
  message: '',
  linkTo: '/messages/conversations',
  icon: 'chat',
};

module.exports = {
  UPDATED_PROFILE,
  INVITED,
  MESSAGE_SENT,
  CONTRACT_SUBMITTED,
};

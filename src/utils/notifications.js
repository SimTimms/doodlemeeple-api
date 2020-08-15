const UPDATED_PROFILE = {
  title: 'You updated a gallery',
  message: 'Make sure you showcase your best work',
  linkTo: '/app/edit-profile',
  icon: 'insert_photo',
};

const CONTRACT_SUBMITTED = {
  title: `You've got a Quote`,
  message: 'Check it out',
  linkTo: '/app/view-contract/',
  icon: 'request_quote',
};

const CONTRACT_DECLINED = {
  title: `Your quote has been declined`,
  message: 'Your quote has been declined',
  linkTo: '/app/view-contract/',
  icon: 'thumb_down',
};

const CONTRACT_ACCEPTED = {
  title: `Your quote has been accepted`,
  message: 'Your quote has been accepted',
  linkTo: '/app/view-contract/',
  icon: 'thumb_down',
};
const REGISTRATION = {
  title: `Thanks for joining us`,
  message: 'Why not get started with an amazing profile',
  linkTo: '/app/edit-profile/',
  icon: 'contact_mail',
};

const DECLINED = {
  title: `You've had a response`,
  message: 'declined your invitation',
  linkTo: '/app/jobs/',
  icon: 'thumb_down',
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
  REGISTRATION,
  CONTRACT_SUBMITTED,
  DECLINED,
  CONTRACT_DECLINED,
  CONTRACT_ACCEPTED,
};

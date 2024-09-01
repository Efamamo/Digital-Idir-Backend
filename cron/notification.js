const sgMail = require('@sendgrid/mail');
const User = require('../models/user');

const sendNotification = async (news) => {
  const users = await User.find({});

  for (const user of users) {
    const msg = {
      to: user.email,
      from: `"Digital Idir" <${process.env.SENDGRID_SENDER_EMAIL}>`,
      subject: 'News Added',
      text: `Hello ${user.username}, news about ${news.title} added `,
    };
    await sgMail.send(msg);
  }
};

module.exports = sendNotification;

const sgMail = require('@sendgrid/mail');
const User = require('../models/user');

const sendAnnouncmentNotification = async () => {
  const users = await User.find({});

  for (const user of users) {
    const msg = {
      to: user.email,
      from: `"Digital Idir" <${process.env.SENDGRID_SENDER_EMAIL}>`,
      subject: 'Announcement',
      text: `Hello ${user.username}, New Announcement Added`,
    };
    await sgMail.send(msg);
  }
};

module.exports = sendAnnouncmentNotification;

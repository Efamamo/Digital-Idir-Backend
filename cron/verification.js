const sgMail = require('@sendgrid/mail');

const sendVerification = async (user) => {
  const verificationUrl = `http://localhost:5000/api/v1/auth/verify/${user.verificationToken}`;
  const msg = {
    to: user.email,
    from: process.env.EMAIL,
    subject: 'Verify your email',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`,
  };
  await sgMail.send(msg);
};

module.exports = sendVerification;

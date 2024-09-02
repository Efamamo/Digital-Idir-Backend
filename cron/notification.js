const sgMail = require('@sendgrid/mail');
const User = require('../models/user');

const sendNotification = async (news) => {
  const users = await User.find({});

  for (const user of users) {
    const msg = {
      to: user.email,
      from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
      subject: 'News Added',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333333;">Hello ${user.username},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                We are excited to inform you that news about <strong style="color: #1a73e8;">${news.title}</strong> has just been added!
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                Stay updated with our latest news.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                Thank you for being a valued member of our community.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                Best regards,<br>
                <strong>Digital Idir Team</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    };
    await sgMail.send(msg);
  }
};

module.exports = sendNotification;

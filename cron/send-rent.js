const sgMail = require('@sendgrid/mail');
const sendPaymentNotification = async (email) => {
  const msg = {
    to: email,
    from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
    subject: 'Purchase using Digital Idir',
    html: `
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333333;">Thank You for Your Order!</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Dear Valued Customer,<br><br>
                    We are thrilled to inform you that your recent order with <strong>Digital Idir</strong> was successful. Thank you for choosing us!
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Your support means a lot to us. We hope you enjoy your items, and we're here to assist with any questions or support you may need.
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Thank you once again for being a valued member of our community.
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
};

module.exports = sendPaymentNotification;

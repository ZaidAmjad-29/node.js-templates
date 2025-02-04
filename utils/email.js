const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //create transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //define the email options

  const mailOptions = {
    from: 'zaid amjad <h.zaidamjad@hello.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //actually send email through nodemailer

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;

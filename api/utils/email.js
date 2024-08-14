const nodemailer = require("nodemailer");

// Configure email transport
const transporter = nodemailer.createTransport({
  host: "sabaragamuathsalu.online",
  port: 465,
  secure: true,
  auth: {
    user: "info@sabaragamuathsalu.online",
    pass: "VC,^LF.I-@{3",
  },
});

// Utility function to send email
async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: `"Sabaragamu Athsalu""info@sabaragamuathsalu.online"`,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;

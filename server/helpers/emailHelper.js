import transporter from "../config/mail.js";

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"Trading Dashboard" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log("✅ Email Sent:", info.messageId);

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email Error:", error.message);

    return {
      sent: false,
      error: error.message,
    };
  }
};
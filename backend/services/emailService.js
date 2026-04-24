const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  return await resend.emails.send({
    from: "noreply@send.authlogin.site", // ✅ your domain
    to: to, // ✅ correct
    subject: "Your OTP Code 🔐",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });
};

module.exports = { sendOtpEmail };
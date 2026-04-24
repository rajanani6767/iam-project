const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  try {
    const response = await resend.emails.send({
      from: "noreply@loginauth.site", // ✅ correct domain
      to: to,
      subject: "Your OTP Code 🔐",
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    console.log("Email sent:", response);
    return true;

  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
};

module.exports = { sendOtpEmail }; // 🔥 VERY IMPORTANT
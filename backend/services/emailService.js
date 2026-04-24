const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOtpEmail = async (email, otp) => {
  await resend.emails.send({
    from: "noreply@send.authlogin.site"
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2>`
  });
};

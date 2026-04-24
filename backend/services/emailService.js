const sendOtpEmail = async (to, otp) => {
  return resend.emails.send({
    from: "noreply@send.loginauth.site",
    to: to,
    subject: "OTP",
    html: `<h2>${otp}</h2>`
  });
};
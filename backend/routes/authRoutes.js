const express = require("express");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");

const router = express.Router();

// Temporary store for OTPs (in-memory)
const otpStore = new Map();

// 📩 Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(email, otp);

  // Delete OTP after 5 minutes
  setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);

  await sendEmail(email, "Your OTP Code", `Your verification code is: ${otp}`);

  res.json({ message: "OTP sent successfully" });
});

// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore.get(email) === otp) {
    otpStore.delete(email);
    res.json({ success: true, message: "OTP verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
});

module.exports = router;

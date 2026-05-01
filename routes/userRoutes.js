const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

router.post("/register", async (req, res) => {
  try {
    // 1. Save user to MongoDB
    const user = new User(req.body);
    await user.save();
    console.log("✅ User saved to MongoDB:", user.email);

    // 2. Check env vars are actually loaded
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
    console.log("🔑 EMAIL_PASS length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : "MISSING");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Email env vars are missing!");
      return res.json({ message: "User saved ✅ but email env vars missing ❌" });
    }

    // 3. Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Verify SMTP connection before sending — this catches bad credentials immediately
    await transporter.verify();
    console.log("✅ Gmail SMTP connection verified");

    // 5. Send email
    await transporter.sendMail({
      from: `"GlobalPhDHub" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "🚀 New Lead - GlobalPhDHub",
      html: `
        <div style="font-family:sans-serif;padding:24px;background:#f9f9f9;border-radius:8px;max-width:500px;">
          <h2 style="color:#f5a623;margin-top:0;">New Student Registration 🎓</h2>
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr style="background:#fff;">
              <td style="padding:10px;font-weight:bold;width:100px;">Name</td>
              <td style="padding:10px;">${user.name}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;">Email</td>
              <td style="padding:10px;">${user.email}</td>
            </tr>
            <tr style="background:#fff;">
              <td style="padding:10px;font-weight:bold;">Phone</td>
              <td style="padding:10px;">${user.phone}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;">Interest</td>
              <td style="padding:10px;">${user.interest}</td>
            </tr>
            <tr style="background:#fff;">
              <td style="padding:10px;font-weight:bold;">Time (IST)</td>
              <td style="padding:10px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
            </tr>
          </table>
        </div>
      `,
    });

    console.log("✅ Email sent to", process.env.EMAIL_USER);
    res.json({ message: "User saved + Email sent ✅" });

  } catch (err) {
    // Log the full error so Render logs show exactly what went wrong
    console.error("❌ ERROR CODE:", err.code);
    console.error("❌ ERROR MESSAGE:", err.message);
    console.error("❌ SMTP RESPONSE:", err.response || "none");

    res.status(500).json({
      error: err.message,
      code: err.code || "unknown",
      smtp: err.response || "No SMTP response — check Render logs"
    });
  }
});

module.exports = router;
